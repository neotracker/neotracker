import { createChild, serverLogger } from '@neotracker/logger';
import { Asset, RootLoader } from '@neotracker/server-db';
import { CodedError, pubsub } from '@neotracker/server-utils';
import { GAS_ASSET_HASH, tryParseDateStringToSeconds, tryParseNumber } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import fetch from 'cross-fetch';
import { GraphQLResolveInfo } from 'graphql';
import _ from 'lodash';
import { combineLatest, concat, Observable, timer } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { CURRENT_PRICE } from '../channels';
import { GraphQLResolver } from '../constants';
import { GraphQLContext } from '../GraphQLContext';
import { RootCall, RootCallOptions } from '../lib';
import { liveExecuteField } from '../live';

const FIVE_MINUTES_IN_SECONDS = 5 * 60;
const GAS = 'GAS';
const SYM_TO_COINMARKETCAP_ID = {
  NEO: 1376,
  GAS: 1785,
};

const serverGQLLogger = createChild(serverLogger, { component: 'graphql' });

export class CurrentPriceRootCall extends RootCall {
  public static readonly fieldName: string = 'current_price';
  public static readonly typeName: string = 'CurrentPrice';
  public static readonly args: { readonly [fieldName: string]: string } = {
    sym: 'String!',
  };
  // tslint:disable-next-line no-any readonly-keyword
  public static readonly mutableCurrentPrices: { [key: string]: any } = {};
  // tslint:disable-next-line readonly-keyword
  public static readonly mutableRefreshing: { [key: string]: boolean } = {};

  // tslint:disable no-any
  public static makeResolver(): GraphQLResolver<any> {
    const resolve = async (
      _obj: any,
      { sym }: { [key: string]: any },
      _context: GraphQLContext,
      _info: GraphQLResolveInfo,
    ): Promise<any> => {
      if (typeof sym !== 'string') {
        throw new CodedError(CodedError.PROGRAMMING_ERROR);
      }
      if (sym !== 'NEO' && sym !== 'GAS') {
        throw new CodedError(CodedError.PROGRAMMING_ERROR);
      }
      // tslint:enable no-any
      const assetID = SYM_TO_COINMARKETCAP_ID[sym];

      return CurrentPriceRootCall.mutableCurrentPrices[assetID];
    };

    return {
      resolve,
      live: liveExecuteField((rootValue, args, context, info) =>
        concat(
          resolve(rootValue, args, context, info),
          pubsub.observable$(CURRENT_PRICE).pipe(filter((payload) => payload.sym === args.sym)),
        ),
      ),
    };
  }

  public static async refreshCurrentPrice(
    sym: keyof typeof SYM_TO_COINMARKETCAP_ID,
    rootLoader: RootLoader,
    coinMarketCapApiKey: string,
  ) {
    const assetID = SYM_TO_COINMARKETCAP_ID[sym];

    if (this.mutableRefreshing[assetID]) {
      return;
    }
    this.mutableRefreshing[assetID] = true;
    const previousCurrentPrice = this.mutableCurrentPrices[assetID];
    this.mutableCurrentPrices[assetID] = await this.getCurrentPrice(sym, assetID, rootLoader, coinMarketCapApiKey);

    const currentPrice = this.mutableCurrentPrices[assetID];
    if (currentPrice != undefined && !_.isEqual(currentPrice, previousCurrentPrice)) {
      pubsub.publish(CURRENT_PRICE, currentPrice);
    }
    this.mutableRefreshing[assetID] = false;
  }

  public static async getCurrentPrice(
    sym: string,
    assetID: number,
    rootLoader: RootLoader,
    coinMarketCapApiKey: string,
    // tslint:disable-next-line no-any
  ): Promise<any> {
    let tries = 1;
    const logInfo = {
      title: 'coinmarketcap_fetch',
    };
    // tslint:disable-next-line no-loop-statement
    while (tries >= 0) {
      try {
        const response = await fetch(
          `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${assetID}`,
          {
            headers: {
              'X-CMC_PRO_API_KEY': coinMarketCapApiKey,
            },
          },
        );
        const jsonResult = await response.json();
        if (jsonResult.status.error_code !== 0) {
          throw { message: 'Problem with CoinMarketCap API', cmc_status: jsonResult.status };
        }
        const result = jsonResult.data[assetID].quote.USD;
        serverGQLLogger.info({ ...logInfo, coinmarketcap_fetch_result: jsonResult });

        const priceUSD = tryParseNumber({ value: result.price });
        let marketCapUSD = result.market_cap;
        if (marketCapUSD == undefined && assetID === SYM_TO_COINMARKETCAP_ID[GAS]) {
          const asset = await Asset.query(rootLoader.db)
            .context(rootLoader.makeAllPowerfulQueryContext())
            .where('id', GAS_ASSET_HASH)
            .first();
          if (asset !== undefined) {
            marketCapUSD = new BigNumber(asset.issued)
              .times(priceUSD)
              .integerValue(BigNumber.ROUND_FLOOR)
              .toString();
          }
        }

        return {
          id: `${assetID}:${result.last_updated}`,
          sym,
          price_usd: Number(new BigNumber(priceUSD).toFixed(2)),
          percent_change_24h: tryParseNumber({
            value: result.percent_change_24h,
          }),
          volume_usd_24h: tryParseNumber({
            value: result.volume_24h,
          }),
          market_cap_usd: marketCapUSD,
          last_updated: tryParseDateStringToSeconds({ value: result.last_updated }),
        };
      } catch (error) {
        serverGQLLogger.error({ ...logInfo, error });
        tries -= 1;
      }
    }

    return this.mutableCurrentPrices[assetID];
  }

  // tslint:disable-next-line no-any
  public static initialize$(options$: Observable<RootCallOptions>): Observable<any> {
    return combineLatest([
      options$.pipe(map(({ rootLoader, coinMarketCapApiKey }) => ({ rootLoader, coinMarketCapApiKey }))),
      timer(0, FIVE_MINUTES_IN_SECONDS * 1000),
    ]).pipe(
      switchMap(async ([{ rootLoader, coinMarketCapApiKey }]) => {
        await Promise.all([
          this.refreshCurrentPrice(
            'NEO',
            rootLoader,
            coinMarketCapApiKey,
          ) /* this.refreshCurrentPrice('GAS', rootLoader, coinMarketCapApiKey) */,
        ]);
      }),
    );
  }
}

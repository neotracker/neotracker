import { Monitor } from '@neo-one/monitor';
import { Asset, RootLoader } from '@neotracker/server-db';
import { CodedError, pubsub } from '@neotracker/server-utils';
import { GAS_ASSET_HASH, tryParseNumber } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import fetch from 'cross-fetch';
import { GraphQLResolveInfo } from 'graphql';
import _ from 'lodash';
import { combineLatest, concat, Observable, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { CURRENT_PRICE } from '../channels';
import { GraphQLResolver } from '../constants';
import { GraphQLContext } from '../GraphQLContext';
import { RootCall, RootCallOptions } from '../lib';
import { liveExecuteField } from '../live';

const THREE_MINUTES_IN_SECONDS = 3 * 60;
const GAS = 'gas';
const SYM_TO_COINMARKETCAP: { [K in string]?: string } = {
  NEO: 'neo',
  GAS,
};

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
      // tslint:enable no-any
      const assetID = SYM_TO_COINMARKETCAP[sym];
      if (assetID === undefined) {
        throw new CodedError(CodedError.PROGRAMMING_ERROR);
      }

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

  public static async refreshCurrentPrice(sym: string, monitor: Monitor, rootLoader: RootLoader) {
    const assetID = SYM_TO_COINMARKETCAP[sym];
    if (assetID === undefined) {
      return;
    }

    if (this.mutableRefreshing[assetID]) {
      return;
    }
    this.mutableRefreshing[assetID] = true;
    const previousCurrentPrice = this.mutableCurrentPrices[assetID];
    this.mutableCurrentPrices[assetID] = await this.getCurrentPrice(sym, assetID, monitor, rootLoader);

    const currentPrice = this.mutableCurrentPrices[assetID];
    if (currentPrice != undefined && !_.isEqual(currentPrice, previousCurrentPrice)) {
      pubsub.publish(CURRENT_PRICE, currentPrice);
    }
    this.mutableRefreshing[assetID] = false;
  }

  public static async getCurrentPrice(
    sym: string,
    assetID: string,
    monitor: Monitor,
    rootLoader: RootLoader,
    // tslint:disable-next-line no-any
  ): Promise<any> {
    let tries = 1;
    // tslint:disable-next-line no-loop-statement
    while (tries >= 0) {
      try {
        // tslint:disable-next-line prefer-immediate-return
        const finalResult = await monitor.captureLog(
          async () => {
            const response = await fetch(`https://api.coinmarketcap.com/v1/ticker/${assetID}/`);

            const [result] = await response.json();

            const priceUSD = tryParseNumber({ value: result.price_usd });
            let marketCapUSD = result.market_cap_usd;
            if (marketCapUSD == undefined && assetID === GAS) {
              const asset = await Asset.query(rootLoader.db)
                .context(rootLoader.makeAllPowerfulQueryContext(monitor))
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
                value: result['24h_volume_usd'],
              }),
              market_cap_usd: marketCapUSD,
              last_updated: tryParseNumber({ value: result.last_updated }),
            };
          },
          { name: 'coinmarketcap_fetch', level: 'verbose', error: {} },
        );

        // tslint:disable-next-line no-var-before-return
        return finalResult;
      } catch {
        tries -= 1;
      }
    }

    return this.mutableCurrentPrices[assetID];
  }

  // tslint:disable-next-line no-any
  public static initialize$(options$: Observable<RootCallOptions>): Observable<any> {
    return combineLatest(
      options$.pipe(
        map(({ rootLoader, monitor }) => ({ rootLoader, monitor })),
        distinctUntilChanged((a, b) => a.monitor === b.monitor),
        map(({ rootLoader, monitor }) => ({
          rootLoader,
          monitor: monitor.at('current_price_root_call'),
        })),
      ),

      timer(0, THREE_MINUTES_IN_SECONDS * 1000),
    ).pipe(
      switchMap(async ([{ rootLoader, monitor }]) => {
        await Promise.all([
          this.refreshCurrentPrice('NEO', monitor, rootLoader),
          this.refreshCurrentPrice('GAS', monitor, rootLoader),
        ]);
      }),
    );
  }
}

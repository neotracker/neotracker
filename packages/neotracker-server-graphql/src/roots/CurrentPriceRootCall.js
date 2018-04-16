/* @flow */
import { GAS_ASSET_HASH, tryParseNumber } from 'neotracker-shared-utils';
import { type RootLoader, Asset } from 'neotracker-server-db';
import BigNumber from 'bignumber.js';
import { CodedError, pubsub } from 'neotracker-server-utils';
import type { GraphQLResolveInfo } from 'graphql';
import type { Monitor } from '@neo-one/monitor';
import { Observable } from 'rxjs/Observable';

import _ from 'lodash';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { concat } from 'rxjs/observable/concat';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import fetch from 'node-fetch';
import { timer } from 'rxjs/observable/timer';

import { CURRENT_PRICE } from '../channels';
import type { GraphQLContext } from '../GraphQLContext';
import type { GraphQLResolver } from '../constants';
import { RootCall, type RootCallOptions } from '../lib';

import { liveExecuteField } from '../live';

const THREE_MINUTES_IN_SECONDS = 3 * 60;
const GAS = 'gas';
const SYM_TO_COINMARKETCAP = {
  NEO: 'neo',
  GAS,
};

export default class CurrentPriceRootCall extends RootCall {
  static fieldName: string = 'current_price';
  static typeName: string = 'CurrentPrice';
  static args: { [fieldName: string]: string } = {
    sym: 'String!',
  };
  static currentPrices = {};
  static refreshing = {};

  static makeResolver(): GraphQLResolver<*> {
    const resolve = async (
      obj: Object,
      { sym }: { [key: string]: any },
      context: GraphQLContext,
      // eslint-disable-next-line no-unused-vars
      info: GraphQLResolveInfo,
    ): Promise<any> => {
      const assetID = SYM_TO_COINMARKETCAP[sym];
      if (assetID == null) {
        throw new CodedError(CodedError.PROGRAMMING_ERROR);
      }

      return CurrentPriceRootCall.currentPrices[assetID];
    };
    return {
      resolve,
      live: liveExecuteField((rootValue, args, context, info) =>
        concat(
          resolve(rootValue, args, context, info),
          pubsub
            .observable(CURRENT_PRICE)
            .pipe(filter(payload => (payload: any).sym === args.sym)),
        ),
      ),
    };
  }

  static async refreshCurrentPrice(
    sym: string,
    monitor: Monitor,
    rootLoader: RootLoader,
  ) {
    const assetID = SYM_TO_COINMARKETCAP[sym];
    if (this.refreshing[assetID]) {
      return;
    }
    this.refreshing[assetID] = true;
    const previousCurrentPrice = this.currentPrices[assetID];
    this.currentPrices[assetID] = await this.getCurrentPrice(
      sym,
      assetID,
      monitor,
      rootLoader,
    );
    const currentPrice = this.currentPrices[assetID];
    if (
      currentPrice != null &&
      !_.isEqual(currentPrice, previousCurrentPrice)
    ) {
      pubsub.publish(CURRENT_PRICE, currentPrice);
    }
    this.refreshing[assetID] = false;
  }

  static async getCurrentPrice(
    sym: string,
    assetID: string,
    monitor: Monitor,
    rootLoader: RootLoader,
  ): Promise<Object> {
    let tries = 1;
    while (tries >= 0) {
      try {
        // eslint-disable-next-line
        const finalResult = await monitor.captureLog(
          async () => {
            const response = await fetch(
              `https://api.coinmarketcap.com/v1/ticker/${assetID}/`,
            );
            const [result] = await response.json();

            const priceUSD = tryParseNumber({ value: result.price_usd });
            let marketCapUSD = result.market_cap_usd;
            if (marketCapUSD == null && assetID === GAS) {
              const asset = await Asset.query(rootLoader.db)
                .context(rootLoader.makeAllPowerfulQueryContext(monitor))
                .where('hash', GAS_ASSET_HASH)
                .first();
              if (asset != null) {
                marketCapUSD = Math.floor(priceUSD * asset.issued);
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
        return finalResult;
      } catch (error) {
        tries -= 1;
      }
    }

    return this.currentPrices[assetID];
  }

  static initialize(options$: Observable<RootCallOptions>): Observable<any> {
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
      options => options,
    ).pipe(
      switchMap(async ({ rootLoader, monitor }) => {
        await Promise.all([
          this.refreshCurrentPrice('NEO', monitor, rootLoader),
          this.refreshCurrentPrice('GAS', monitor, rootLoader),
        ]);
      }),
    );
  }
}

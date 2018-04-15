/* @flow */
import type { GraphQLResolveInfo } from 'graphql';
import type { Monitor } from '@neo-one/monitor';
import { Observable } from 'rxjs/Observable';

import _ from 'lodash';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { concat } from 'rxjs/observable/concat';
import cryptocompare from 'cryptocompare';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { pubsub } from 'neotracker-server-utils';
import { timer } from 'rxjs/observable/timer';

import { PRICES } from '../channels';
import type { GraphQLContext } from '../GraphQLContext';
import type { GraphQLResolver } from '../constants';
import { RootCall, type RootCallOptions } from '../lib';

import { liveExecuteField } from '../live';

type Args = {|
  from: string,
  to: string,
|};

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

export default class PricesRootCall extends RootCall {
  static fieldName: string = 'prices';
  static typeName: string = '[DataPoint!]!';
  static args: { [fieldName: string]: string } = {
    from: 'String!',
    to: 'String!',
  };
  static dataPoints = {};
  static refreshing = {};

  static resolver = async (
    obj: Object,
    { from, to }: Args,
    context: GraphQLContext,
    // eslint-disable-next-line no-unused-vars
    info: GraphQLResolveInfo,
  ): Promise<any> => {
    const key = PricesRootCall.getKey(from, to);
    if (PricesRootCall.dataPoints[key] == null) {
      PricesRootCall.dataPoints[key] = [];
    }

    return PricesRootCall.dataPoints[key];
  };

  static makeResolver(): GraphQLResolver<*> {
    const resolve = async (
      obj: Object,
      { from, to }: { [key: string]: any },
      context: GraphQLContext,
      // eslint-disable-next-line no-unused-vars
      info: GraphQLResolveInfo,
    ): Promise<any> => {
      const key = PricesRootCall.getKey(from, to);
      if (PricesRootCall.dataPoints[key] == null) {
        PricesRootCall.dataPoints[key] = [];
      }

      return PricesRootCall.dataPoints[key];
    };
    return {
      resolve,
      live: liveExecuteField((rootValue, args, context, info) =>
        concat(
          resolve(rootValue, args, context, info),
          pubsub
            .observable(PRICES)
            .pipe(
              filter(
                payload =>
                  (payload: any).from === args.from &&
                  (payload: any).to === args.to,
              ),
              map(payload => (payload: any).prices),
            ),
        ),
      ),
    };
  }

  static async refreshDataPoints(from: string, to: string, monitor: Monitor) {
    const key = this.getKey(from, to);
    if (this.refreshing[key]) {
      return;
    }
    this.refreshing[key] = true;

    if (this.dataPoints[key] == null) {
      this.dataPoints[key] = [];
    }
    const previousDataPoints = this.dataPoints[key];
    this.dataPoints[key] = await this.getDataPoints(from, to, monitor);
    const dataPoints = this.dataPoints[key];
    if (dataPoints.length > 0 && !_.isEqual(dataPoints, previousDataPoints)) {
      pubsub.publish(PRICES, { prices: dataPoints, from, to });
    }
    this.refreshing[key] = false;
  }

  static async getDataPoints(
    from: string,
    to: string,
    monitor: Monitor,
  ): Promise<Array<any>> {
    const key = this.getKey(from, to);
    // TODO: Fix me
    if (from === 'GAS' || to === 'GAS') {
      return [];
    }

    let tries = 1;
    while (tries >= 0) {
      try {
        // eslint-disable-next-line
        const finalResult = await monitor.captureLog(
          async () => {
            const result = await cryptocompare.histoHour(from, to);
            return result.map(point => ({
              id: `${key}:${point.time}`,
              type: key,
              time: point.time,
              value: point.close,
            }));
          },
          { name: 'cryptocompare_fetch', level: 'verbose', error: {} },
        );
        return finalResult;
      } catch (error) {
        tries -= 1;
      }
    }

    return this.dataPoints[key];
  }

  static getKey(from: string, to: string) {
    return `${from}to${to}`;
  }

  static initialize(options$: Observable<RootCallOptions>): Observable<any> {
    return combineLatest(
      options$.pipe(
        map(({ monitor }) => monitor),
        distinctUntilChanged(),
        map(monitor => monitor.at('prices_root_call')),
      ),
      timer(0, FIVE_MINUTES_IN_SECONDS * 1000),
      options => options,
    ).pipe(
      switchMap(async monitor => {
        await Promise.all([
          this.refreshDataPoints('NEO', 'BTC', monitor),
          this.refreshDataPoints('NEO', 'USD', monitor),
        ]);
      }),
    );
  }
}

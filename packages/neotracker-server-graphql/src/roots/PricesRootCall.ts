// tslint:disable no-any no-object-mutation
import { Monitor } from '@neo-one/monitor';
// @ts-ignore
import cryptocompare from 'cryptocompare';
import { GraphQLResolveInfo } from 'graphql';
import * as _ from 'lodash';
import { pubsub } from 'neotracker-server-utils';
import { combineLatest, concat, Observable, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { PRICES } from '../channels';
import { GraphQLResolver } from '../constants';
import { GraphQLContext } from '../GraphQLContext';
import { RootCall, RootCallOptions } from '../lib';
import { liveExecuteField } from '../live';

interface Args {
  readonly from: string;
  readonly to: string;
}

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

export class PricesRootCall extends RootCall {
  public static readonly fieldName: string = 'prices';
  public static readonly typeName: string = '[DataPoint!]!';
  public static readonly args: { readonly [fieldName: string]: string } = {
    from: 'String!',
    to: 'String!',
  };
  // tslint:disable-next-line readonly-keyword
  public static readonly mutableDataPoints: { [K in string]?: any } = {};
  // tslint:disable-next-line readonly-keyword
  public static readonly mutableRefreshing: { [K in string]: boolean } = {};
  public static readonly resolver = async (
    _obj: any,
    { from, to }: Args,
    _context: GraphQLContext,
    _info: GraphQLResolveInfo,
  ): Promise<any> => {
    const key = PricesRootCall.getKey(from, to);
    if (PricesRootCall.mutableDataPoints[key] == undefined) {
      PricesRootCall.mutableDataPoints[key] = [];
    }

    return PricesRootCall.mutableDataPoints[key];
  };

  public static makeResolver(): GraphQLResolver<any> {
    const resolve = async (
      _obj: any,
      { from, to }: { [key: string]: any },
      _context: GraphQLContext,
      _info: GraphQLResolveInfo,
    ): Promise<any> => {
      const key = PricesRootCall.getKey(from, to);
      if (PricesRootCall.mutableDataPoints[key] === undefined) {
        PricesRootCall.mutableDataPoints[key] = [];
      }

      return PricesRootCall.mutableDataPoints[key];
    };

    return {
      resolve,
      live: liveExecuteField((rootValue, args, context, info) =>
        concat(
          resolve(rootValue, args, context, info),
          pubsub.observable$(PRICES).pipe(
            filter((payload) => payload.from === args.from && payload.to === args.to),

            map((payload) => payload.prices),
          ),
        ),
      ),
    };
  }

  public static async refreshDataPoints(from: string, to: string, monitor: Monitor) {
    const key = this.getKey(from, to);
    if (this.mutableRefreshing[key]) {
      return;
    }
    this.mutableRefreshing[key] = true;

    if (this.mutableDataPoints[key] == undefined) {
      this.mutableDataPoints[key] = [];
    }
    const previousDataPoints = this.mutableDataPoints[key];
    this.mutableDataPoints[key] = await this.getDataPoints(from, to, monitor);
    const mutableDataPoints = this.mutableDataPoints[key];
    if (mutableDataPoints.length > 0 && !_.isEqual(mutableDataPoints, previousDataPoints)) {
      pubsub.publish(PRICES, { prices: mutableDataPoints, from, to });
    }
    this.mutableRefreshing[key] = false;
  }

  public static async getDataPoints(from: string, to: string, monitor: Monitor): Promise<ReadonlyArray<any>> {
    const key = this.getKey(from, to);
    if (from === 'GAS' || to === 'GAS') {
      return [];
    }

    let tries = 1;
    // tslint:disable-next-line no-loop-statement
    while (tries >= 0) {
      try {
        // tslint:disable-next-line prefer-immediate-return
        const finalResult = await monitor.captureLog(
          async () => {
            const result = await cryptocompare.histoHour(from, to);

            return result.map((point: any) => ({
              id: `${key}:${point.time}`,
              type: key,
              time: point.time,
              value: point.close,
            }));
          },
          { name: 'cryptocompare_fetch', level: 'verbose', error: {} },
        );

        // tslint:disable-next-line no-var-before-return
        return finalResult;
      } catch {
        tries -= 1;
      }
    }

    return this.mutableDataPoints[key];
  }

  public static getKey(from: string, to: string) {
    return `${from}to${to}`;
  }

  public static initialize$(options$: Observable<RootCallOptions>): Observable<any> {
    return combineLatest(
      options$.pipe(
        map(({ monitor }) => monitor),
        distinctUntilChanged(),
        map((monitor) => monitor.at('prices_root_call')),
      ),
      timer(0, FIVE_MINUTES_IN_SECONDS * 1000),
    ).pipe(
      switchMap(async ([monitor]) => {
        await Promise.all([
          this.refreshDataPoints('NEO', 'BTC', monitor),
          this.refreshDataPoints('NEO', 'USD', monitor),
        ]);
      }),
    );
  }
}

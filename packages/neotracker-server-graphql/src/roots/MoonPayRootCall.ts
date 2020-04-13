import { CodedError } from '@neotracker/server-utils';
import crypto from 'crypto';
import { GraphQLResolveInfo } from 'graphql';
import { concat, EMPTY, Observable, of as _of } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { GraphQLResolver } from '../constants';
import { GraphQLContext } from '../GraphQLContext';
import { RootCall, RootCallOptions } from '../lib';
import { liveExecuteField } from '../live';

interface MoonPayOptions {
  readonly moonpayPrivateApiKey: string;
}

const createUrlWithSignature = (originalUrl: string, moonpayPrivateApiKey: string): string => {
  const signature = crypto
    .createHmac('sha256', moonpayPrivateApiKey)
    .update(new URL(originalUrl).search)
    .digest('base64');

  return `${originalUrl}&signature=${encodeURIComponent(signature)}`;
};

export class MoonPayRootCall extends RootCall {
  public static readonly fieldName: string = 'moonpay';
  public static readonly typeName: string = 'MoonPay';
  public static readonly args: { readonly [fieldName: string]: string } = {
    url: 'String!',
  };

  public static getAppOptions$(): Observable<MoonPayOptions> {
    if (this.mutableMoonpayOptions$ === undefined) {
      throw new CodedError(CodedError.PROGRAMMING_ERROR);
    }

    return this.mutableMoonpayOptions$;
  }

  // tslint:disable-next-line no-any
  public static makeResolver(): GraphQLResolver<any> {
    const resolve = async (
      // tslint:disable-next-line no-any
      _obj: any,
      // tslint:disable-next-line no-any
      { url }: { readonly [key: string]: any },
      _context: GraphQLContext,
      _info: GraphQLResolveInfo,
    ) => {
      if (url == undefined) {
        throw new CodedError(CodedError.PROGRAMMING_ERROR);
      }
      const appOptions$ = this.getAppOptions$();
      const { moonpayPrivateApiKey } = await appOptions$.pipe(take(1)).toPromise();

      return { secureUrl: createUrlWithSignature(url, moonpayPrivateApiKey) };
    };

    return {
      resolve,
      live: liveExecuteField((rootValue, args, context, info) =>
        concat(_of([undefined]), resolve(rootValue, args, context, info)),
      ),
    };
  }

  // tslint:disable-next-line no-any
  public static initialize$(options$: Observable<RootCallOptions>): Observable<never> {
    this.mutableMoonpayOptions$ = options$.pipe(
      distinctUntilChanged(),
      map(({ moonpayPrivateApiKey }) => ({
        moonpayPrivateApiKey,
      })),
    );

    return EMPTY;
  }

  private static mutableMoonpayOptions$: Observable<MoonPayOptions> | undefined;
}

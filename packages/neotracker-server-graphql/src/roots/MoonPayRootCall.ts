import { createChild, serverLogger } from '@neotracker/logger';
import { CodedError } from '@neotracker/server-utils';
import crypto from 'crypto';
import { GraphQLResolveInfo } from 'graphql';
import LRUCache from 'lru-cache';
import { concat, EMPTY, Observable, of as _of } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { GraphQLResolver } from '../constants';
import { GraphQLContext } from '../GraphQLContext';
import { RootCall, RootCallOptions } from '../lib';
import { liveExecuteField } from '../live';

interface MoonPayOptions {
  readonly moonpayPrivateApiKey: string;
  readonly moonpayUrl: string;
}

const serverGQLLogger = createChild(serverLogger, { component: 'graphql' });

const hashCache = new LRUCache<string, string>(100);

export class MoonPayRootCall extends RootCall {
  public static readonly fieldName: string = 'moonpay';
  public static readonly typeName: string = 'MoonPay';
  public static readonly args: { readonly [fieldName: string]: string } = {
    url: 'String',
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
      const createUrlWithSignature = (originalUrl: string, moonpayPrivateApiKeyIn: string): string => {
        if (hashCache.has(originalUrl)) {
          return `${originalUrl}&signature=${encodeURIComponent(hashCache.get(originalUrl) as string)}`;
        }
        const signature = crypto
          .createHmac('sha256', moonpayPrivateApiKeyIn)
          .update(new URL(originalUrl).search)
          .digest('base64');

        hashCache.set(originalUrl, signature);

        return `${originalUrl}&signature=${encodeURIComponent(signature)}`;
      };

      const { moonpayPrivateApiKey, moonpayUrl } = await this.getAppOptions$()
        .pipe(take(1))
        .toPromise();
      if (url === undefined || url === null || !url.startsWith(moonpayUrl)) {
        serverGQLLogger.info({
          title: 'moonpay_invalid_url_return',
          expected_url_base: moonpayUrl,
          url_in: url,
        });

        return { secureUrl: '', validUrl: false };
      }

      return { secureUrl: createUrlWithSignature(url, moonpayPrivateApiKey), validUrl: true };
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
      map(({ moonpayPrivateApiKey, appOptions: { moonpayUrl } }) => ({
        moonpayPrivateApiKey,
        moonpayUrl,
      })),
      distinctUntilChanged(),
    );

    return EMPTY;
  }

  private static mutableMoonpayOptions$: Observable<MoonPayOptions> | undefined;
}

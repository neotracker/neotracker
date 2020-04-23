import { RootLoader } from '@neotracker/server-db';
import { CodedError } from '@neotracker/server-utils';
import { AppOptions } from '@neotracker/shared-utils';
import { EMPTY, Observable } from 'rxjs';
import { GraphQLResolver } from '../constants';
export interface RootCallOptions {
  readonly appOptions: AppOptions;
  readonly rootLoader: RootLoader;
  readonly coinMarketCapApiKey: string;
}

// tslint:disable-next-line no-unnecessary-class
export class RootCall {
  public static readonly fieldName: string;
  public static readonly typeName: string;
  public static readonly args: { readonly [fieldName: string]: string };

  // tslint:disable-next-line no-any
  public static makeResolver(): GraphQLResolver<any> {
    throw new CodedError(CodedError.PROGRAMMING_ERROR);
  }

  public static initialize$(
    _options$: Observable<RootCallOptions>,
    // tslint:disable-next-line no-any
  ): Observable<any> {
    return EMPTY;
  }
}

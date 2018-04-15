/* @flow */
import { CodedError } from 'neotracker-server-utils';
import type { GraphQLResolveInfo } from 'graphql';
import type { Observable } from 'rxjs/Observable';

import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { empty } from 'rxjs/observable/empty';

import type { GraphQLContext } from '../GraphQLContext';
import type { GraphQLResolver } from '../constants';
import { RootCall, type RootCallOptions } from '../lib';

import { liveExecuteField } from '../live';

export default class AppOptionsRootCall extends RootCall {
  static fieldName: string = 'app_options';
  static typeName: string = 'String!';
  static args: { [fieldName: string]: string } = {};

  static _appOptions$: ?Observable<string>;

  static makeResolver(): GraphQLResolver<*> {
    return {
      resolve: async (
        obj: Object,
        args: { [key: string]: any },
        context: GraphQLContext,
        // eslint-disable-next-line no-unused-vars
        info: GraphQLResolveInfo,
      ): Promise<any> => {
        const appOptions$ = this.getAppOptions$();
        const appOptions = await appOptions$.pipe(take(1)).toPromise();

        return appOptions;
      },
      live: liveExecuteField(() => this.getAppOptions$()),
    };
  }

  static getAppOptions$(): Observable<string> {
    if (this._appOptions$ == null) {
      throw new CodedError(CodedError.PROGRAMMING_ERROR);
    }

    return this._appOptions$;
  }

  static initialize(options$: Observable<RootCallOptions>): Observable<any> {
    this._appOptions$ = options$.pipe(
      map(options => options.appOptions),
      distinctUntilChanged(),
      map(appOptions => JSON.stringify(appOptions)),
    );

    return empty();
  }
}

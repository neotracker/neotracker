import { CodedError } from '@neotracker/server-utils';
import { EMPTY, Observable } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { GraphQLResolver } from '../constants';
import { GraphQLContext } from '../GraphQLContext';
import { RootCall, RootCallOptions } from '../lib';
import { liveExecuteField } from '../live';

export class AppOptionsRootCall extends RootCall {
  public static readonly fieldName: string = 'app_options';
  public static readonly typeName: string = 'String!';
  public static readonly args: { readonly [fieldName: string]: string } = {};

  // tslint:disable no-any
  public static makeResolver(): GraphQLResolver<any> {
    return {
      resolve: async (_obj: any, _args: { [key: string]: any }, _context: GraphQLContext, _info: any): Promise<any> => {
        // tslint:enable no-any
        const appOptions$ = this.getAppOptions$();

        return appOptions$.pipe(take(1)).toPromise();
      },
      live: liveExecuteField(() => this.getAppOptions$()),
    };
  }

  public static getAppOptions$(): Observable<string> {
    if (this.mutableAppOptions$ === undefined) {
      throw new CodedError(CodedError.PROGRAMMING_ERROR);
    }

    return this.mutableAppOptions$;
  }

  // tslint:disable-next-line no-any
  public static initialize$(options$: Observable<RootCallOptions>): Observable<any> {
    this.mutableAppOptions$ = options$.pipe(
      map((options) => options.appOptions),
      distinctUntilChanged(),
      map((appOptions) => JSON.stringify(appOptions)),
    );

    return EMPTY;
  }

  private static mutableAppOptions$: Observable<string> | undefined;
}

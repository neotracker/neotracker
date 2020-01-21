import { PROCESSED_NEXT_INDEX } from '@neotracker/server-db';
import { CodedError, pubsub } from '@neotracker/server-utils';
import { GraphQLResolveInfo } from 'graphql';
import { concat, of as _of } from 'rxjs';
import { GraphQLResolver } from '../constants';
import { GraphQLContext } from '../GraphQLContext';
import { RootCall } from '../lib';
import { liveExecuteField } from '../live';

export class BlockchainRootCall extends RootCall {
  // tslint:disable no-any
  public static async resolver(
    _obj: any,
    _args: { readonly [key: string]: any },
    _context: GraphQLContext,
    _info: GraphQLResolveInfo,
  ): Promise<any> {
    await Promise.reject(new CodedError(CodedError.PROGRAMMING_ERROR));
  }
  // tslint:enable no-any

  // tslint:disable-next-line no-any
  public static makeResolver(): GraphQLResolver<any> {
    return {
      resolve: this.resolver,
      live: liveExecuteField(() => concat(_of(undefined), pubsub.observable$(PROCESSED_NEXT_INDEX))),
    };
  }
}

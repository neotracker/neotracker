/* @flow */
import { PROCESSED_NEXT_INDEX } from 'neotracker-server-db';
import { CodedError, pubsub } from 'neotracker-server-utils';
import type { GraphQLResolveInfo } from 'graphql';

import { concat } from 'rxjs/observable/concat';
import { of as _of } from 'rxjs/observable/of';

import type { GraphQLContext } from '../GraphQLContext';
import type { GraphQLResolver } from '../constants';
import { RootCall } from '../lib';

import { liveExecuteField } from '../live';

export default class BlockchainRootCall extends RootCall {
  static async resolver(
    obj: Object,
    args: { [key: string]: any },
    context: GraphQLContext,
    // eslint-disable-next-line no-unused-vars
    info: GraphQLResolveInfo,
  ): Promise<any> {
    throw new CodedError(CodedError.PROGRAMMING_ERROR);
  }

  static makeResolver(): GraphQLResolver<*> {
    return {
      resolve: this.resolver,
      live: liveExecuteField(() =>
        concat(_of(null), pubsub.observable(PROCESSED_NEXT_INDEX)),
      ),
    };
  }
}

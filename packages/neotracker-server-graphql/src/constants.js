/* @flow */
import type { ExecutionResult } from 'neotracker-shared-graphql';
import type { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { Observable } from 'rxjs';

import type { GraphQLContext } from './GraphQLContext';

export type GraphQLLiveResolver<TSource> = (
  source: TSource,
  args: { [argument: string]: any },
  context: GraphQLContext,
  info: GraphQLResolveInfo,
) => Observable<ExecutionResult>;

export type GraphQLResolver<TSource> = {|
  resolve: GraphQLFieldResolver<TSource, GraphQLContext>,
  live: GraphQLLiveResolver<TSource>,
|};

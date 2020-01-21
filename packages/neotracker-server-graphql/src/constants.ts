import { ExecutionResult } from '@neotracker/shared-graphql';
import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { Observable } from 'rxjs';
import { GraphQLContext } from './GraphQLContext';

export type GraphQLLiveResolver<TSource> = (
  source: TSource,
  // tslint:disable-next-line no-any
  args: { readonly [argument: string]: any },
  context: GraphQLContext,
  info: GraphQLResolveInfo,
) => Observable<ExecutionResult>;
export interface GraphQLResolver<TSource> {
  readonly resolve: GraphQLFieldResolver<TSource, GraphQLContext>;
  readonly live: GraphQLLiveResolver<TSource>;
}

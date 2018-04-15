/* @flow */
import type { GraphQLResolveInfo } from 'graphql';
import type { Monitor } from '@neo-one/monitor';

import type { RootLoader } from './loader';

export type GraphQLContext = {
  rootLoader: RootLoader,
  getMonitor: (info?: GraphQLResolveInfo) => Monitor,
};
export type GraphQLFieldResolver<TSource, TContext> = (
  source: TSource,
  args: { [argument: string]: any },
  context: TContext,
  info: Object,
) => mixed;

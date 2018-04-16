/* @flow */
import type { DocumentNode, GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import type { Monitor } from '@neo-one/monitor';
import type { RootLoader } from 'neotracker-server-db';

export type GraphQLContext = {|
  rootLoader: RootLoader,
  query: DocumentNode,
  queryID: string,
  schema: GraphQLSchema,
  spans: { [key: string]: Monitor },
  getMonitor: (info?: GraphQLResolveInfo) => Monitor,
|};

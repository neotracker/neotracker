import { Monitor } from '@neo-one/monitor';
import { RootLoader } from '@neotracker/server-db';
import { DocumentNode, GraphQLResolveInfo, GraphQLSchema } from 'graphql';

export interface GraphQLContext {
  readonly rootLoader: RootLoader;
  readonly query: DocumentNode;
  readonly queryID: string;
  readonly schema: GraphQLSchema;
  // tslint:disable-next-line readonly-keyword
  readonly spans: { [K in string]?: Monitor };
  readonly getMonitor: ((info?: GraphQLResolveInfo) => Monitor);
}

import { RootLoader } from '@neotracker/server-db';
import { DocumentNode, GraphQLSchema } from 'graphql';

export interface GraphQLContext {
  readonly rootLoader: RootLoader;
  readonly query: DocumentNode;
  readonly queryID: string;
  readonly schema: GraphQLSchema;
}

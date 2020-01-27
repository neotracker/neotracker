import { RootLoader } from '@neotracker/server-db';
import { DocumentNode } from 'graphql';
import { GraphQLContext } from './GraphQLContext';
import { schema } from './schema';

export function makeContext(rootLoader: RootLoader, query: DocumentNode, queryID: string): GraphQLContext {
  return {
    rootLoader,
    query,
    queryID,
    schema: schema(),
  };
}

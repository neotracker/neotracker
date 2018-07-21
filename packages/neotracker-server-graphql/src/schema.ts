import { models } from '@neotracker/server-db';
import { GraphQLSchema } from 'graphql';
import { inputs } from './inputs';
import { makeSchema } from './makeSchema';
import { roots } from './roots';
import { types } from './types';

// tslint:disable-next-line no-let
let schemaCache: GraphQLSchema | undefined;

export const schema = (forceNew = false): GraphQLSchema => {
  if (!forceNew && schemaCache !== undefined) {
    return schemaCache;
  }

  schemaCache = makeSchema({
    models: models(),
    roots: roots(),
    inputs: inputs(),
    types: types(),
  });

  return schemaCache;
};

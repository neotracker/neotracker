import { Base } from '@neotracker/server-db';
import { makeExecutableSchema } from 'graphql-tools';
import { SchemaBuilder } from './gen/SchemaBuilder';
import { Input, Mutation, RootCall, Type } from './lib';

export function makeSchema({
  models,
  types = [],
  inputs = [],
  roots = [],
  mutations = [],
  doProfiling = true,
}: {
  readonly models: ReadonlyArray<typeof Base>;
  readonly types?: ReadonlyArray<typeof Type>;
  readonly inputs?: ReadonlyArray<typeof Input>;
  readonly roots?: ReadonlyArray<typeof RootCall>;
  readonly mutations?: ReadonlyArray<typeof Mutation>;
  readonly doProfiling?: boolean;
}) {
  const builder = new SchemaBuilder(models, types, inputs, roots, mutations, doProfiling);

  const { typeDefs, resolvers } = builder.build();

  return makeExecutableSchema({ typeDefs: [...typeDefs], resolvers });
}

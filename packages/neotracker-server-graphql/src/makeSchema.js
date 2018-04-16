/* @flow */
import type { Base } from 'neotracker-server-db';

import { makeExecutableSchema } from 'graphql-tools';

import { type Input, type Mutation, type RootCall, type Type } from './lib';
import SchemaBuilder from './gen/SchemaBuilder';

export default function({
  models,
  types = [],
  inputs = [],
  roots = [],
  mutations = [],
  doProfiling = true,
}: {|
  models: Array<Class<Base>>,
  types?: Array<Class<Type>>,
  inputs?: Array<Class<Input>>,
  roots?: Array<Class<RootCall>>,
  mutations?: Array<Class<Mutation>>,
  doProfiling?: boolean,
|}) {
  const builder = new SchemaBuilder(
    models,
    types || [],
    inputs || [],
    roots || [],
    mutations || [],
    doProfiling || false,
  );
  const { typeDefs, resolvers } = builder.build();
  return makeExecutableSchema({ typeDefs, resolvers });
}

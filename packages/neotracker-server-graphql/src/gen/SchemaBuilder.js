/* @flow */
import { type Base } from 'neotracker-server-db';

import { type Input, type Mutation, type RootCall, type Type } from '../lib';
import ResolverBuilder from './ResolverBuilder';
import TypeDefsBuilder from './TypeDefsBuilder';

export default class SchemaBuilder {
  models: Array<Class<Base>>;
  types: Array<Class<Type>>;
  inputs: Array<Class<Input>>;
  roots: Array<Class<RootCall>>;
  mutations: Array<Class<Mutation>>;
  doProfiling: boolean;

  constructor(
    models: Array<Class<Base>>,
    types: Array<Class<Type>>,
    inputs: Array<Class<Input>>,
    roots: Array<Class<RootCall>>,
    mutations: Array<Class<Mutation>>,
    doProfiling: boolean,
  ) {
    this.models = models;
    this.types = types;
    this.inputs = inputs;
    this.roots = roots;
    this.mutations = mutations;
    this.doProfiling = doProfiling;
  }

  build(): { typeDefs: Array<string>, resolvers: Object } {
    return {
      typeDefs: new TypeDefsBuilder(
        this.models,
        this.types,
        this.inputs,
        this.roots,
        this.mutations,
      ).build(),
      resolvers: new ResolverBuilder(
        this.models,
        this.types,
        this.inputs,
        this.roots,
        this.mutations,
        this.doProfiling,
      ).build(),
    };
  }
}

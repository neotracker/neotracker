import { Base } from '@neotracker/server-db';
import { Input, Mutation, RootCall, Type } from '../lib';
import { ResolverBuilder } from './ResolverBuilder';
import { TypeDefsBuilder } from './TypeDefsBuilder';

export class SchemaBuilder {
  public readonly models: ReadonlyArray<typeof Base>;
  public readonly types: ReadonlyArray<typeof Type>;
  public readonly inputs: ReadonlyArray<typeof Input>;
  public readonly roots: ReadonlyArray<typeof RootCall>;
  public readonly mutations: ReadonlyArray<typeof Mutation>;
  public readonly doProfiling: boolean;

  public constructor(
    models: ReadonlyArray<typeof Base>,
    types: ReadonlyArray<typeof Type>,
    inputs: ReadonlyArray<typeof Input>,
    roots: ReadonlyArray<typeof RootCall>,
    mutations: ReadonlyArray<typeof Mutation>,
    doProfiling: boolean,
  ) {
    this.models = models;
    this.types = types;
    this.inputs = inputs;
    this.roots = roots;
    this.mutations = mutations;
    this.doProfiling = doProfiling;
  }

  // tslint:disable-next-line no-any
  public build(): { readonly typeDefs: ReadonlyArray<string>; readonly resolvers: any } {
    return {
      typeDefs: new TypeDefsBuilder(this.models, this.types, this.inputs, this.roots, this.mutations).build(),
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

import DataLoader from 'dataloader';
import Knex from 'knex';
import { BaseModel, QueryContext } from '../lib';
import { Block, Transaction } from '../models';
export type NumberLoader<T> = DataLoader<{ readonly id: number }, T>;
export type StringLoader<T> = DataLoader<{ readonly id: string }, T>;
export interface Loaders {
  readonly [id: string]: NumberLoader<BaseModel | undefined>;
}
export interface LoadersByField {
  readonly [id: string]: Loaders;
}
export interface LoadersByEdge {
  readonly [name: string]: { readonly [edgeName: string]: NumberLoader<ReadonlyArray<BaseModel>> };
}

export class RootLoader {
  public readonly db: Knex;
  public readonly makeQueryContext: () => QueryContext;
  public readonly makeAllPowerfulQueryContext: () => QueryContext;
  public readonly loaders: Loaders;
  public readonly loadersByField: LoadersByField;
  public readonly loadersByEdge: LoadersByEdge;
  public readonly blockHashLoader: StringLoader<Block | undefined>;
  public readonly transactionHashLoader: StringLoader<Transaction | undefined>;
  public readonly maxIndexFetcher: { readonly get: () => Promise<number>; readonly reset: () => void };

  public constructor({
    db,
    makeQueryContext,
    makeAllPowerfulQueryContext,
    loaders,
    loadersByField,
    loadersByEdge,
    blockHashLoader,
    transactionHashLoader,
    maxIndexFetcher,
  }: {
    readonly db: Knex;
    readonly makeQueryContext: () => QueryContext;
    readonly makeAllPowerfulQueryContext: () => QueryContext;
    readonly loaders: Loaders;
    readonly loadersByField: LoadersByField;
    readonly loadersByEdge: LoadersByEdge;
    readonly blockHashLoader: StringLoader<Block | undefined>;
    readonly transactionHashLoader: StringLoader<Transaction | undefined>;
    readonly maxIndexFetcher: { readonly get: () => Promise<number>; readonly reset: () => void };
  }) {
    this.db = db;
    this.makeQueryContext = makeQueryContext;
    this.makeAllPowerfulQueryContext = makeAllPowerfulQueryContext;
    this.loaders = loaders;
    this.loadersByField = loadersByField;
    this.loadersByEdge = loadersByEdge;
    this.blockHashLoader = blockHashLoader;
    this.transactionHashLoader = transactionHashLoader;
    this.maxIndexFetcher = maxIndexFetcher;
  }

  public readonly reset = (): void => {
    Object.values(this.loaders).forEach((loader) => loader.clearAll());
    Object.values(this.loadersByField).forEach((fieldLoader) =>
      Object.values(fieldLoader).forEach((loader) => loader.clearAll()),
    );
    Object.values(this.loadersByEdge).forEach((edgeLoader) =>
      Object.values(edgeLoader).forEach((loader) => loader.clearAll()),
    );
    this.blockHashLoader.clearAll();
    this.transactionHashLoader.clearAll();
    this.maxIndexFetcher.reset();
  };
}

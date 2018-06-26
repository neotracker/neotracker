import { Monitor } from '@neo-one/monitor';
import DataLoader from 'dataloader';
import Knex from 'knex';
import { BaseModel, QueryContext } from '../lib';
import { Block, Transaction } from '../models';
export type NumberLoader<T> = DataLoader<{ readonly id: number; readonly monitor: Monitor }, T>;
export type StringLoader<T> = DataLoader<{ readonly id: string; readonly monitor: Monitor }, T>;
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
  public readonly makeQueryContext: ((monitor: Monitor) => QueryContext);
  public readonly makeAllPowerfulQueryContext: ((monitor: Monitor) => QueryContext);
  public readonly loaders: Loaders;
  public readonly loadersByField: LoadersByField;
  public readonly loadersByEdge: LoadersByEdge;
  public readonly blockHashLoader: StringLoader<Block | undefined>;
  public readonly transactionHashLoader: StringLoader<Transaction | undefined>;
  public readonly maxIndexFetcher: { readonly get: (() => Promise<number>) };

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
    readonly makeQueryContext: ((monitor: Monitor) => QueryContext);
    readonly makeAllPowerfulQueryContext: ((monitor: Monitor) => QueryContext);
    readonly loaders: Loaders;
    readonly loadersByField: LoadersByField;
    readonly loadersByEdge: LoadersByEdge;
    readonly blockHashLoader: StringLoader<Block | undefined>;
    readonly transactionHashLoader: StringLoader<Transaction | undefined>;
    readonly maxIndexFetcher: { readonly get: (() => Promise<number>) };
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
}

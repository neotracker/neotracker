/* @flow */
import type DataLoader from 'dataloader';
import type Knex from 'knex';
import type { Monitor } from '@neo-one/monitor';

import { type Block, type Transaction } from '../models';
import { type BaseModel, type ID, type QueryContext } from '../lib';

export type NumberLoader<T> = DataLoader<{| id: number, monitor: Monitor |}, T>;
export type StringLoader<T> = DataLoader<{| id: string, monitor: Monitor |}, T>;

export type Loaders = { [id: string]: NumberLoader<?BaseModel<ID>> };
export type LoadersByField = { [id: string]: Loaders };
export type LoadersByEdge = {
  [name: string]: { [edgeName: string]: NumberLoader<Array<BaseModel<ID>>> },
};

export default class RootLoader {
  db: Knex<*>;
  makeQueryContext: (monitor: Monitor) => QueryContext;
  makeAllPowerfulQueryContext: (monitor: Monitor) => QueryContext;
  loaders: Loaders;
  loadersByField: LoadersByField;
  loadersByEdge: LoadersByEdge;
  blockHashLoader: StringLoader<?Block>;
  transactionHashLoader: StringLoader<?Transaction>;
  maxIndexFetcher: { get: () => Promise<string> };

  constructor({
    db,
    makeQueryContext,
    makeAllPowerfulQueryContext,
    loaders,
    loadersByField,
    loadersByEdge,
    blockHashLoader,
    transactionHashLoader,
    maxIndexFetcher,
  }: {|
    db: Knex<*>,
    makeQueryContext: (monitor: Monitor) => QueryContext,
    makeAllPowerfulQueryContext: (monitor: Monitor) => QueryContext,
    loaders: Loaders,
    loadersByField: LoadersByField,
    loadersByEdge: LoadersByEdge,
    blockHashLoader: StringLoader<?Block>,
    transactionHashLoader: StringLoader<?Transaction>,
    maxIndexFetcher: { get: () => Promise<string> },
  |}) {
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

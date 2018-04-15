/* @flow */
import type DataLoader from 'dataloader';
import type Knex from 'knex';
import type { Monitor } from '@neo-one/monitor';

import {
  type Address,
  type Asset,
  type Block,
  type Contract,
  type Transaction,
} from '../models';
import { type BaseModel, type QueryContext } from '../lib';

export type NumberLoader<T> = DataLoader<{| id: number, monitor: Monitor |}, T>;
export type StringLoader<T> = DataLoader<{| id: string, monitor: Monitor |}, T>;

export type Loaders = { [id: string]: NumberLoader<?BaseModel> };
export type LoadersByField = { [id: string]: Loaders };
export type LoadersByEdge = {
  [name: string]: { [edgeName: string]: NumberLoader<Array<BaseModel>> },
};
export type HashLoaders = {
  address: StringLoader<?Address>,
  asset: StringLoader<?Asset>,
  block: StringLoader<?Block>,
  contract: StringLoader<?Contract>,
  transaction: StringLoader<?Transaction>,
};

export default class RootLoader {
  db: Knex<*>;
  makeQueryContext: (monitor: Monitor) => QueryContext;
  makeAllPowerfulQueryContext: (monitor: Monitor) => QueryContext;
  loaders: Loaders;
  loadersByField: LoadersByField;
  loadersByEdge: LoadersByEdge;
  hashLoaders: HashLoaders;
  blockIndexLoader: StringLoader<?Block>;
  maxIndexFetcher: { get: () => Promise<string> };

  constructor({
    db,
    makeQueryContext,
    makeAllPowerfulQueryContext,
    loaders,
    loadersByField,
    loadersByEdge,
    hashLoaders,
    blockIndexLoader,
    maxIndexFetcher,
  }: {|
    db: Knex<*>,
    makeQueryContext: (monitor: Monitor) => QueryContext,
    makeAllPowerfulQueryContext: (monitor: Monitor) => QueryContext,
    loaders: Loaders,
    loadersByField: LoadersByField,
    loadersByEdge: LoadersByEdge,
    hashLoaders: HashLoaders,
    blockIndexLoader: StringLoader<?Block>,
    maxIndexFetcher: { get: () => Promise<string> },
  |}) {
    this.db = db;
    this.makeQueryContext = makeQueryContext;
    this.makeAllPowerfulQueryContext = makeAllPowerfulQueryContext;
    this.loaders = loaders;
    this.loadersByField = loadersByField;
    this.loadersByEdge = loadersByEdge;
    this.hashLoaders = hashLoaders;
    this.blockIndexLoader = blockIndexLoader;
    this.maxIndexFetcher = maxIndexFetcher;
  }
}

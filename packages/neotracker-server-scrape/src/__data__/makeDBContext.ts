import { Monitor } from '@neo-one/monitor';
import Knex from 'knex';
import { createRootLoader, makeQueryContext as makeQueryContextInternal, PubSub } from 'neotracker-server-db';
import { EMPTY } from 'rxjs';
import { DBContext } from '../types';
import { IWriteCache } from '../WriteCache';

// tslint:disable-next-line no-any
const createWriteCacheMock = (): IWriteCache<any, any, any, any> => ({
  get: jest.fn(async () => undefined),
  getThrows: jest.fn(async () => Promise.reject(new Error('Not Implemented'))),
  save: jest.fn(async () => Promise.reject(new Error('Not Implemented'))),
  revert: jest.fn(async () => Promise.reject(new Error('Not Implemented'))),
  refresh: jest.fn(() => {
    throw new Error('Not Implemented');
  }),
});

// tslint:disable-next-line no-any
const createPubSubMock = (): PubSub<any> => ({
  next: jest.fn(async () => Promise.resolve()),
  close: jest.fn(),
  value$: EMPTY,
});

const createMakeQueryContext = (db: Knex) => (monitor: Monitor) =>
  makeQueryContextInternal({
    monitor,
    rootLoader: () => createRootLoader(db, { cacheSize: 1000, cacheEnabled: true }, monitor),
    isAllPowerful: true,
  });

export const makeDBContext = ({
  db,
  makeQueryContext = createMakeQueryContext(db),
  getBlock = jest.fn(async () => Promise.reject(new Error('Not Implemented'))),
  prevBlock,
  currentHeight = -1,
  address = createWriteCacheMock(),
  asset = createWriteCacheMock(),
  contract = createWriteCacheMock(),
  systemFee = createWriteCacheMock(),
  nep5Contracts = {},
  chunkSize = 1000,
  processedIndexPubSub = createPubSubMock(),
}: Partial<DBContext> & { readonly db: DBContext['db'] }): DBContext => ({
  db,
  makeQueryContext,
  getBlock,
  prevBlock,
  currentHeight,
  address,
  asset,
  contract,
  systemFee,
  nep5Contracts,
  chunkSize,
  processedIndexPubSub,
});

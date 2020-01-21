import { createRootLoader, makeQueryContext as makeQueryContextInternal, PubSub } from '@neotracker/server-db';
import Knex from 'knex';
import { EMPTY } from 'rxjs';
import { Context } from '../../types';
import { IWriteCache } from '../../WriteCache';

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

const createMakeQueryContext = (db: Knex) => () =>
  makeQueryContextInternal({
    rootLoader: () => createRootLoader(db, { cacheSize: 1000, cacheEnabled: true }),
    isAllPowerful: true,
  });

export const makeContext = ({
  db,
  makeQueryContext = createMakeQueryContext(db),
  client = {
    getBlock: jest.fn(async () => Promise.reject(new Error('Not Implemented'))),
    smartContract: jest.fn(async () => Promise.reject(new Error('Not Implemented'))),
    // tslint:disable-next-line no-any
  } as any,
  fullClient = {
    getBlock: jest.fn(async () => Promise.reject(new Error('Not Implemented'))),
    smartContract: jest.fn(async () => Promise.reject(new Error('Not Implemented'))),
    // tslint:disable-next-line no-any
  } as any,
  // tslint:disable-next-line no-any
  migrationHandler = {} as any,
  prevBlockData,
  currentHeight = -1,
  systemFee = createWriteCacheMock(),
  nep5Contracts = {},
  chunkSize = 1000,
  processedIndexPubSub = createPubSubMock(),
  blacklistNEP5Hashes = new Set<string>(),
  repairNEP5BlockFrequency = 300,
  repairNEP5LatencySeconds = 15,
  network = 'main',
}: Partial<Context> & { readonly db: Context['db'] }): Context => ({
  db,
  makeQueryContext,
  migrationHandler,
  client,
  fullClient,
  prevBlockData,
  currentHeight,
  systemFee,
  nep5Contracts,
  chunkSize,
  processedIndexPubSub,
  blacklistNEP5Hashes,
  repairNEP5BlockFrequency,
  repairNEP5LatencySeconds,
  network,
});

/* @flow */
import {
  type QueryContext,
  type Address as AddressModel,
  type Asset as AssetModel,
  type Block as BlockModel,
  type Contract as ContractModel,
  type Transaction as TransactionModel,
} from 'neotracker-server-db';
import {
  type Asset,
  type Contract,
  type ReadSmartContract,
  type ReadClient,
  type NEOONEDataProvider,
} from '@neo-one/client';
import type { Monitor } from '@neo-one/monitor';
import type { Observable } from 'rxjs/Observable';

import type knex from 'knex';

import type MigrationHandler from './MigrationHandler';
import type WriteCache from './WriteCache';

export type AddressSave = {|
  hash: string,
  transactionModel?: TransactionModel,
|};

export type AssetSave = {|
  asset: {
    type: $PropertyType<Asset, 'type'> | 'NEP5',
    name: string,
    symbol?: string,
    amount: string,
    precision: number,
    owner?: string,
    admin?: string,
  },
  transactionModel: TransactionModel,
  hash?: string,
|};

export type ContractSave = {|
  contract: Contract,
  blockModel: BlockModel,
  transactionModel: TransactionModel,
|};

export type SystemFeeSave = {|
  index: number,
  value: string,
|};

export type Context = {|
  db: knex<*>,
  makeQueryContext: (monitor: Monitor) => QueryContext,
  client: ReadClient<NEOONEDataProvider>,
  prevBlock: ?BlockModel,
  currentHeight: ?number,
  address: WriteCache<string, AddressModel, AddressSave>,
  asset: WriteCache<string, AssetModel, AssetSave>,
  contract: WriteCache<string, ContractModel, ContractSave>,
  systemFee: WriteCache<number, string, SystemFeeSave>,
  rpxFixed: boolean,
  rhtFixed: boolean,
  contractModelsToProcess: Array<[ContractModel, ReadSmartContract]>,
  nep5Contracts: { [hash: string]: ReadSmartContract },
  migrationHandler: MigrationHandler,
  nep5Hashes$: Observable<Array<string>>,
  repairNEP5BlockFrequency: number,
  repairNEP5LatencySeconds: number,
|};

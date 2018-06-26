import { Asset, Contract, NEOONEDataProvider, ReadClient, ReadSmartContract } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import Knex from 'knex';
import {
  Address as AddressModel,
  Asset as AssetModel,
  Block as BlockModel,
  Contract as ContractModel,
  QueryContext,
  Transaction as TransactionModel,
} from 'neotracker-server-db';
import { Observable } from 'rxjs';
import { MigrationHandler } from './MigrationHandler';
import { WriteCache } from './WriteCache';

export interface AddressSave {
  readonly hash: string;
  readonly transactionModel?: TransactionModel;
}
export interface AssetSave {
  readonly asset: {
    readonly type: Asset['type'] | 'NEP5';
    readonly name: string;
    readonly symbol?: string;
    readonly amount: string;
    readonly precision: number;
    readonly owner?: string;
    readonly admin?: string;
  };

  readonly transactionModel: TransactionModel;
  readonly hash?: string;
}
export interface ContractSave {
  readonly contract: Contract;
  readonly blockModel: BlockModel;
  readonly transactionModel: TransactionModel;
}
export interface SystemFeeSave {
  readonly index: number;
  readonly value: string;
}
export interface Context {
  readonly db: Knex;
  readonly makeQueryContext: ((monitor: Monitor) => QueryContext);
  readonly client: ReadClient<NEOONEDataProvider>;
  // tslint:disable-next-line readonly-keyword
  prevBlock: BlockModel | undefined;
  // tslint:disable-next-line readonly-keyword
  currentHeight: number | undefined;
  readonly address: WriteCache<string, AddressModel, AddressSave>;
  readonly asset: WriteCache<string, AssetModel, AssetSave>;
  readonly contract: WriteCache<string, ContractModel, ContractSave>;
  readonly systemFee: WriteCache<number, BigNumber, SystemFeeSave>;
  // tslint:disable-next-line readonly-array readonly-keyword
  contractModelsToProcess: Array<[ContractModel, ReadSmartContract]>;
  readonly nep5Contracts: { [K in string]?: ReadSmartContract };
  readonly migrationHandler: MigrationHandler;
  readonly blacklistNEP5Hashes$: Observable<ReadonlyArray<string>>;
  readonly repairNEP5BlockFrequency: number;
  readonly repairNEP5LatencySeconds: number;
}

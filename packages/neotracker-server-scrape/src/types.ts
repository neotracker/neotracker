import {
  ActionRaw,
  Asset,
  ConfirmedTransaction,
  Contract,
  NEOONEDataProvider,
  ReadClient,
  ReadSmartContract,
} from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import Knex from 'knex';
import {
  Action as ActionModel,
  Address as AddressModel,
  Asset as AssetModel,
  Block as BlockModel,
  Contract as ContractModel,
  PubSub,
  QueryContext,
  Transaction as TransactionModel,
  TransactionInputOutput as TransactionInputOutputModel,
} from 'neotracker-server-db';
import { Observable } from 'rxjs';
import { ProcessedIndexUpdater } from './db';
import { MigrationHandler } from './MigrationHandler';
import { WriteCache } from './WriteCache';

export interface AddressRevert {
  readonly hash: string;
  readonly blockIndex: number;
  readonly transactionID?: string;
}
export interface AddressSave extends AddressRevert {
  readonly blockTime: number;
  readonly transactionHash?: string;
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
  readonly transactionID: string;
  readonly transactionHash: string;
  readonly blockIndex: number;
  readonly blockTime: number;
  readonly hash?: string;
}
export interface ContractSave {
  readonly contract: Contract;
  readonly transactionID: string;
  readonly transactionHash: string;
  readonly blockIndex: number;
  readonly blockTime: number;
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
  readonly address: WriteCache<string, AddressModel, AddressSave, AddressRevert>;
  readonly asset: WriteCache<string, AssetModel, AssetSave, string>;
  readonly contract: WriteCache<string, ContractModel, ContractSave, string>;
  readonly systemFee: WriteCache<number, BigNumber, SystemFeeSave, number>;
  // tslint:disable-next-line readonly-array readonly-keyword
  contractModelsToProcess: Array<[ContractModel, ReadSmartContract]>;
  readonly nep5Contracts: { [K in string]?: ReadSmartContract };
  readonly migrationHandler: MigrationHandler;
  readonly blacklistNEP5Hashes$: Observable<ReadonlyArray<string>>;
  readonly repairNEP5BlockFrequency: number;
  readonly repairNEP5LatencySeconds: number;
  readonly chunkSize: number;
  readonly processedIndexPubSub: PubSub<{ readonly index: number }>;
}

export interface Updaters {
  readonly processedIndex: ProcessedIndexUpdater;
}

export interface CoinChange {
  readonly address: string;
  readonly asset: string;
  readonly value: BigNumber;
}

export interface CoinChanges {
  readonly transactionIndex: number;
  readonly actionIndex?: number;
  readonly changes: ReadonlyArray<CoinChange>;
}

export interface InputOutputResultAddressIDs {
  readonly [addressID: string]: {
    readonly startTransactionID: string;
    readonly startTransactionHash: string;
    readonly startTransactionIndex: number;
  };
}

export interface InputOutputResult {
  readonly assetIDs: ReadonlyArray<string>;
  readonly addressIDs: InputOutputResultAddressIDs;
  readonly coinChanges?: CoinChanges;
}

export interface TransferResult {
  readonly fromAddressID: string | undefined;
  readonly toAddressID: string | undefined;
  readonly assetID: string;
  readonly transferID: string;
  readonly coinChanges: CoinChanges;
}

export interface TransferData {
  readonly result: TransferResult;
  readonly value: BigNumber;
}

export interface ActionData<TAction> {
  readonly action: TAction;
  readonly transfer?: TransferData;
}

export interface TransactionData {
  readonly inputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly claims: ReadonlyArray<TransactionInputOutputModel>;
  readonly actionDatas: ReadonlyArray<ActionData<ActionRaw>>;
  readonly result: InputOutputResult;
  readonly transaction: ConfirmedTransaction;
  readonly transactionHash: string;
  readonly transactionID: string;
  readonly transactionIndex: number;
}

export interface TransactionModelData {
  readonly claims: ReadonlyArray<TransactionInputOutputModel>;
  readonly inputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly outputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly transactionModel: TransactionModel;
  readonly transactionID: string;
  readonly actionDatas: ReadonlyArray<ActionData<ActionModel>>;
  readonly result: InputOutputResult;
  readonly contractModels: ReadonlyArray<ContractModel>;
}

export interface ContractActionData {
  readonly actionData: ActionData<ActionRaw>;
  readonly result: InputOutputResult;
  readonly transactionHash: string;
  readonly transactionID: string;
  readonly transactionIndex: number;
  readonly blockIndex: number;
  readonly blockTime: number;
}

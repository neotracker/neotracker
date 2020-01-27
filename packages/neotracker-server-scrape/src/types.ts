import {
  Asset,
  Client,
  ConfirmedTransaction,
  Contract,
  NEOONEDataProvider,
  nep5,
  RawAction,
  ReadClient,
} from '@neo-one/client-full';
import {
  Action as ActionModel,
  Coin as CoinModel,
  Contract as ContractModel,
  PubSub,
  QueryContext,
  Transaction as TransactionModel,
  TransactionInputOutput as TransactionInputOutputModel,
} from '@neotracker/server-db';
import BigNumber from 'bignumber.js';
import Knex from 'knex';
import { MigrationHandler } from './MigrationHandler';
import { IWriteCache } from './WriteCache';

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
export interface BlockData {
  readonly previous_block_id: number;
  readonly previous_block_hash: string;
  readonly validator_address_id: string;
  readonly aggregated_system_fee: string;
}
export interface Context {
  readonly db: Knex;
  readonly network: string;
  readonly makeQueryContext: () => QueryContext;
  readonly prevBlockData: BlockData | undefined;
  readonly currentHeight: number | undefined;
  readonly systemFee: IWriteCache<number, BigNumber, SystemFeeSave, number>;
  readonly nep5Contracts: { readonly [K in string]?: nep5.NEP5SmartContract };
  readonly chunkSize: number;
  readonly processedIndexPubSub: PubSub<{ readonly index: number }>;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly fullClient: Client;
  readonly migrationHandler: MigrationHandler;
  readonly blacklistNEP5Hashes: Set<string>;
  readonly repairNEP5BlockFrequency: number;
  readonly repairNEP5LatencySeconds: number;
}

export interface CoinChange {
  readonly address: string;
  readonly asset: string;
  readonly value: BigNumber;
}

export type CoinChanges = ReadonlyArray<CoinChange>;

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

export interface TransactionData extends InputOutputResult {
  readonly claims: ReadonlyArray<TransactionInputOutputModel>;
  readonly inputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly outputs: ReadonlyArray<{
    readonly type: string;
    readonly subtype: string;
    readonly output_transaction_id: string;
    readonly output_transaction_hash: string;
    readonly output_transaction_index: number;
    readonly output_block_id: number;
    readonly asset_id: string;
    readonly value: string;
    readonly address_id: string;
  }>;
  readonly actionDatas: ReadonlyArray<ActionData<RawAction>>;
  readonly transaction: ConfirmedTransaction;
  readonly transactionHash: string;
  readonly transactionID: string;
  readonly transactionIndex: number;
}

export interface TransactionModelData extends InputOutputResult {
  readonly claims: ReadonlyArray<TransactionInputOutputModel>;
  readonly inputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly outputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly actionDatas: ReadonlyArray<ActionData<ActionModel>>;
  readonly transactionModel: TransactionModel;
  readonly transactionHash: string;
  readonly transactionID: string;
  readonly transactionIndex: number;
  readonly contracts: ReadonlyArray<ContractModel>;
}

export interface ContractActionData extends InputOutputResult {
  readonly actionData: ActionData<RawAction>;
  readonly transactionHash: string;
  readonly transactionID: string;
  readonly transactionIndex: number;
}

export interface AssetData {
  readonly issued: BigNumber;
  readonly addressCount: number;
  readonly transactionCount: number;
  readonly transferCount: number;
}

export interface Assets {
  readonly [asset: string]: AssetData;
}

export interface AddressData {
  readonly transactionCount: number;
  readonly transferCount: number;
  readonly transactionID: string;
  readonly transactionHash: string;
}
export interface Addresses {
  readonly [address: string]: AddressData;
}

export interface CoinModelCreate {
  readonly type: 'create';
  readonly assetHash: string;
  readonly value: Partial<CoinModel>;
}

export function isCoinModelCreate(change: CoinModelChange): change is CoinModelCreate {
  return change.type === 'create';
}

export interface CoinModelDelete {
  readonly type: 'delete';
  readonly assetHash: string;
  readonly id: string;
}

export function isCoinModelDelete(change: CoinModelChange): change is CoinModelDelete {
  return change.type === 'delete';
}

export function isCoinModelCreateOrDelete(change: CoinModelChange): change is CoinModelCreate | CoinModelDelete {
  return isCoinModelCreate(change) || isCoinModelDelete(change);
}

export interface CoinModelPatch {
  readonly type: 'patch';
  readonly value: CoinModel;
  readonly patch: Partial<CoinModel>;
}

export function isCoinModelPatch(change: CoinModelChange): change is CoinModelPatch {
  return change.type === 'patch';
}

export type CoinModelChange = CoinModelCreate | CoinModelDelete | CoinModelPatch;

import { BaseModel } from '../lib';
import { Action } from './Action';
import { Address } from './Address';
import { AddressToTransaction } from './AddressToTransaction';
import { AddressToTransfer } from './AddressToTransfer';
import { Asset } from './Asset';
import { AssetToTransaction } from './AssetToTransaction';
import { Block } from './Block';
import { Coin } from './Coin';
import { Contract } from './Contract';
import { DataPoint } from './DataPoint';
import { KnownContract } from './KnownContract';
import { Migration } from './Migration';
import { ProcessedIndex } from './ProcessedIndex';
import { Transaction } from './Transaction';
import { TransactionInputOutput } from './TransactionInputOutput';
import { Transfer } from './Transfer';

export { Action } from './Action';
export { Address } from './Address';
export { AddressToTransaction } from './AddressToTransaction';
export { AddressToTransfer } from './AddressToTransfer';
export { Asset } from './Asset';
export { AssetToTransaction } from './AssetToTransaction';
export { Block } from './Block';
export { Coin } from './Coin';
export { Contract } from './Contract';
export { DataPoint } from './DataPoint';
export { KnownContract } from './KnownContract';
export { Migration } from './Migration';
export { ProcessedIndex } from './ProcessedIndex';
export { Transaction } from './Transaction';
export { TransactionInputOutput } from './TransactionInputOutput';
export { Transfer } from './Transfer';

export const loaderModels: ReadonlyArray<typeof BaseModel> = [
  Action,
  Address,
  Asset,
  Block,
  Coin,
  Contract,
  DataPoint,
  KnownContract,
  Migration,
  ProcessedIndex,
  Transaction,
  TransactionInputOutput,
  Transfer,
  // tslint:disable-next-line no-any
] as any;

export const models: ReadonlyArray<typeof BaseModel> = [
  Action,
  Address,
  AddressToTransaction,
  AddressToTransfer,
  Asset,
  AssetToTransaction,
  Block,
  Coin,
  Contract,
  DataPoint,
  KnownContract,
  Migration,
  ProcessedIndex,
  Transaction,
  TransactionInputOutput,
  Transfer,
  // tslint:disable-next-line no-any
] as any;

export {
  TYPE_INPUT,
  TYPE_DUPLICATE_CLAIM,
  SUBTYPE_NONE,
  SUBTYPE_ISSUE,
  SUBTYPE_ENROLLMENT,
  SUBTYPE_CLAIM,
  SUBTYPE_REWARD,
  NEP5_BLACKLIST_CONTRACT_TYPE,
  NEP5_CONTRACT_TYPE,
  UNKNOWN_CONTRACT_TYPE,
} from './common';

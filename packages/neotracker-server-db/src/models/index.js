/* @flow */
import Action from './Action';
import Address from './Address';
import AddressToTransaction from './AddressToTransaction';
import AddressToTransfer from './AddressToTransfer';
import Asset from './Asset';
import AssetToTransaction from './AssetToTransaction';
import Block from './Block';
import Coin from './Coin';
import Contract from './Contract';
import DataPoint from './DataPoint';
import KnownContract from './KnownContract';
import Migration from './Migration';
import ProcessedIndex from './ProcessedIndex';
import Transaction from './Transaction';
import TransactionInputOutput from './TransactionInputOutput';
import Transfer from './Transfer';

export { default as Action } from './Action';
export { default as Address } from './Address';
export { default as AddressToTransaction } from './AddressToTransaction';
export { default as AddressToTransfer } from './AddressToTransfer';
export { default as Asset } from './Asset';
export { default as AssetToTransaction } from './AssetToTransaction';
export { default as Block } from './Block';
export { default as Coin } from './Coin';
export { default as Contract } from './Contract';
export { default as DataPoint } from './DataPoint';
export { default as KnownContract } from './KnownContract';
export { default as Migration } from './Migration';
export { default as ProcessedIndex } from './ProcessedIndex';
export { default as Transaction } from './Transaction';
export { default as TransactionInputOutput } from './TransactionInputOutput';
export { default as Transfer } from './Transfer';

export const loaderModels = [
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
];

export default [
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
];

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

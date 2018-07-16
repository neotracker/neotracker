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
import { Migration } from './Migration';
import { ProcessedIndex } from './ProcessedIndex';
import { Transaction } from './Transaction';
import { TransactionInputOutput } from './TransactionInputOutput';
import { Transfer } from './Transfer';

export const loaderModels = (): ReadonlyArray<typeof BaseModel> =>
  [
    Action,
    Address,
    Asset,
    Block,
    Coin,
    Contract,
    DataPoint,
    Migration,
    ProcessedIndex,
    Transaction,
    TransactionInputOutput,
    Transfer,
    // tslint:disable-next-line no-any
  ] as any;

export const models = (): ReadonlyArray<typeof BaseModel> =>
  [
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
    Migration,
    ProcessedIndex,
    Transaction,
    TransactionInputOutput,
    Transfer,
    // tslint:disable-next-line no-any
  ] as any;

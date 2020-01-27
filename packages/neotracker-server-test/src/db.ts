import {
  Action,
  Address,
  AddressToTransaction,
  AddressToTransfer,
  Asset,
  AssetToTransaction,
  Block,
  Coin,
  Contract,
  create,
  createRootLoader,
  createTables,
  DataPoint,
  dropTables,
  makeQueryContext as makeQueryContextInternal,
  Migration,
  ProcessedIndex,
  Transaction,
  TransactionInputOutput,
  Transfer,
} from '@neotracker/server-db';
import Knex from 'knex';
import { addTeardownCleanup } from './addTeardownCleanup';

export interface Database {
  readonly knex: Knex;
  readonly reset: () => Promise<void>;
}

export interface DatabaseConfig {
  readonly database: Database;
  readonly metricsPort: number;
}

export const startDB = async (): Promise<DatabaseConfig> => {
  const options = await neotracker.startDB();

  const db = create({ options: options.db });
  addTeardownCleanup(async () => {
    await db.destroy();
  });

  return {
    database: {
      knex: db,
      reset: async () => {
        await dropTables(db, true);
        await createTables(db);
      },
    },
    metricsPort: options.metricsPort,
  };
};

export interface DBData {
  readonly action: ReadonlyArray<Action>;
  readonly address: ReadonlyArray<Address>;
  readonly addressToTransaction: ReadonlyArray<AddressToTransaction>;
  readonly addressToTransfer: ReadonlyArray<AddressToTransfer>;
  readonly asset: ReadonlyArray<Asset>;
  readonly assetToTransaction: ReadonlyArray<AssetToTransaction>;
  readonly block: ReadonlyArray<Block>;
  readonly coin: ReadonlyArray<Coin>;
  readonly contract: ReadonlyArray<Contract>;
  readonly dataPoint: ReadonlyArray<DataPoint>;
  readonly migration: ReadonlyArray<Migration>;
  readonly processedIndex: ReadonlyArray<ProcessedIndex>;
  readonly transaction: ReadonlyArray<Transaction>;
  readonly transactionInputOutput: ReadonlyArray<TransactionInputOutput>;
  readonly transfer: ReadonlyArray<Transfer>;
}

const makeQueryContext = (db: Knex) =>
  makeQueryContextInternal({
    rootLoader: () => createRootLoader(db, { cacheSize: 1000, cacheEnabled: true }),
    isAllPowerful: true,
  });

export const getDBData = async (db: Knex): Promise<DBData> => {
  const [
    action,
    address,
    addressToTransaction,
    addressToTransfer,
    asset,
    assetToTransaction,
    block,
    coin,
    contract,
    dataPoint,
    migration,
    processedIndex,
    transaction,
    transactionInputOutput,
    transfer,
  ] = await Promise.all([
    Action.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    Address.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    AddressToTransaction.query(db)
      .context(makeQueryContext(db))
      .then((result) => result.map((value) => value.toJSON())),
    AddressToTransfer.query(db)
      .context(makeQueryContext(db))
      .then((result) => result.map((value) => value.toJSON())),
    Asset.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    AssetToTransaction.query(db)
      .context(makeQueryContext(db))
      .then((result) => result.map((value) => value.toJSON())),
    Block.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    Coin.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    Contract.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    DataPoint.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    Migration.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    ProcessedIndex.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    Transaction.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    TransactionInputOutput.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
    Transfer.query(db)
      .context(makeQueryContext(db))
      .orderBy('id')
      .then((result) => result.map((value) => value.toJSON())),
  ]);

  return {
    action,
    address,
    addressToTransaction,
    addressToTransfer,
    asset,
    assetToTransaction,
    block,
    coin,
    contract,
    dataPoint,
    migration,
    processedIndex,
    transaction,
    transactionInputOutput,
    transfer,
    // tslint:disable-next-line no-any
  } as any;
};

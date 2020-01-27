import { Address as AddressModel, Transaction as TransactionModel } from '@neotracker/server-db';
import Knex from 'knex';
import { AddressesDataRevert, AddressesDataSave, AddressesDataUpdater } from '../../../db/AddressesDataUpdater';
import { AddressToTransactionUpdater } from '../../../db/AddressToTransactionUpdater';
import { Addresses } from '../../../types';
import { data, makeContext } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const initialAddress: Partial<AddressModel> & Pick<AddressModel, 'id'> = {
  id: 'A'.repeat(34),
  transaction_hash: 'INIT'.repeat(16),
  transaction_count: '10',
  transfer_count: '5',
  block_id: 0,
  block_time: 15,
  aggregate_block_id: 0,
  transaction_id: '4',
};

const secondaryAddress: Partial<AddressModel> & Pick<AddressModel, 'id'> = {
  id: 'B'.repeat(34),
  transaction_hash: 'UNIT'.repeat(16),
  transaction_count: '10',
  transfer_count: '5',
  block_id: 0,
  block_time: 15,
  aggregate_block_id: 0,
  transaction_id: '9',
  last_transaction_hash: 'NINE'.repeat(16),
  last_transaction_id: '9',
  last_transaction_time: 15,
};

const addressToTransactions = {
  transactions: [
    {
      addressIDs: ['A'.repeat(34)],
      transactionID: '5',
    },
    {
      addressIDs: ['B'.repeat(34)],
      transactionID: '10',
    },
    {
      addressIDs: ['B'.repeat(34)],
      transactionID: '9',
    },
  ],
};

const transactions: ReadonlyArray<{ readonly id: string; readonly hash: string }> = [
  {
    id: '5',
    hash: 'XDXD'.repeat(16),
  },
  {
    id: '10',
    hash: 'TENT'.repeat(16),
  },
  {
    id: '9',
    hash: 'NINE'.repeat(16),
  },
];

const makeAddressesPatch = (addresses: ReadonlyArray<AddressModel>, transactionID: string, transactionHash: string) =>
  addresses.reduce<Addresses>(
    (acc: Addresses, addressModel) => ({
      ...acc,
      [addressModel.id.toString()]: {
        transactionCount: 5,
        transferCount: 5,
        transactionID,
        transactionHash,
      },
    }),
    {},
  );

const initiateTest = async (db: Knex) => {
  const context = makeContext({ db });

  const addressToTransactionUpdater = new AddressToTransactionUpdater();

  const references = await Promise.all([
    AddressModel.query(db)
      .context(context.makeQueryContext())
      .insertAndFetch(data.createAddress({ ...initialAddress })),
    AddressModel.query(db)
      .context(context.makeQueryContext())
      .insertAndFetch(data.createAddress({ ...secondaryAddress })),
  ]);

  await TransactionModel.insertAll(
    db,
    context.makeQueryContext(),
    transactions.map((transaction) => data.createTransaction({ ...transaction })),
  );

  await addressToTransactionUpdater.save(context, {
    ...addressToTransactions,
  });

  return { references };
};

const getInputs = (references: ReadonlyArray<AddressModel>): AddressesDataSave => ({
  addresses: makeAddressesPatch(references.slice(0, 1), '5', 'XDXD'.repeat(16)),
  blockIndex: 1,
  blockTime: 15,
});

const getSecondaryInputs = (references: ReadonlyArray<AddressModel>): AddressesDataSave => ({
  addresses: makeAddressesPatch(references.slice(1), '10', 'TENT'.repeat(16)),
  blockIndex: 1,
  blockTime: 15,
});

const getReversions = (references: ReadonlyArray<AddressModel>): AddressesDataRevert => ({
  addresses: makeAddressesPatch(references.slice(1), '10', 'TENT'.repeat(16)),
  transactionIDs: ['10'],
  blockIndex: 1,
});

const utilOptions: UpdaterUtilTestOptions<AddressesDataSave, AddressesDataRevert, ReadonlyArray<AddressModel>> = {
  name: `AddressesData Updater`,
  initiateTest,
  createUpdater: () => new AddressesDataUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

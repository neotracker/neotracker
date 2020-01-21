import { ConfirmedTransaction, Input, Output } from '@neo-one/client-full';
import { Block, TransactionInputOutput, TYPE_INPUT } from '@neotracker/server-db';
import BigNumber from 'bignumber.js';
import Knex from 'knex';
import { TransactionsRevert, TransactionsSave, TransactionsUpdater } from '../../../db/TransactionsUpdater';
import { data, makeContext } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

interface UnspentOutput extends Output, Input {}

const vinOptionsInit: ReadonlyArray<UnspentOutput> = [
  data.createUnspentOutput(
    { hash: 'AAAA028c38117ac9e42c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e0DDD', index: 1 },
    { value: new BigNumber(6), address: 'XXXEx5f4Zm4oCHwFWiSTaph1fPBxZacAAA' },
  ),
];

const voutOptionsInit: ReadonlyArray<Output> = [
  data.createOutput({ value: new BigNumber(6), address: 'XXXEx5f4Zm4oCHwFWiSTaph1fPBxZacXXX' }),
];

const transactionsInit: ReadonlyArray<ConfirmedTransaction> = [
  data.createConfirmedTransaction({
    transactionBase: {
      inputs: vinOptionsInit,
      outputs: voutOptionsInit,
      hash: 'AAAA028c38117ac9e42c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e0CCC',
    },
    index: 1,
    blockIndex: 1,
    globalIndex: new BigNumber(1),
  }),
];

const vinOptionsSecondary: ReadonlyArray<UnspentOutput> = [
  data.createUnspentOutput(
    { hash: 'HHHH028c38117ac9e42c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e0RRR', index: 4 },
    { value: new BigNumber(6), address: 'XXXEx5f4Zm4oCHwFWiSTaph1fPBxZacBBB' },
  ),
];

const voutOptionsSecondary: ReadonlyArray<Output> = [
  data.createOutput({ value: new BigNumber(6), address: 'XXXEx5f4Zm4oCHwFWiSTaph1fPBxZacOOO' }),
];

const transactionsSecondary: ReadonlyArray<ConfirmedTransaction> = [
  data.createConfirmedTransaction({
    transactionBase: {
      inputs: vinOptionsSecondary,
      outputs: voutOptionsSecondary,
      hash: 'HHHH028c38117ac9e42c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e0HHH',
    },
    index: 2,
    blockIndex: 2,
    globalIndex: new BigNumber(2),
  }),
];

const getInputs = () => ({
  block: data.createBlock({ index: 1 }, transactionsInit),
});

const getSecondaryInputs = () => ({
  block: data.createBlock({ index: 2 }, transactionsSecondary),
});

const initiateTest = async (db: Knex) => {
  const context = makeContext({ db });

  await Promise.all(
    vinOptionsInit.map(async (inOut) => {
      await TransactionInputOutput.query(db)
        .context(context.makeQueryContext())
        .insert(
          data.createTransactionInputOutput({
            id: TransactionInputOutput.makeID({
              type: TYPE_INPUT,
              outputTransactionHash: inOut.hash,
              outputTransactionIndex: inOut.index,
            }),
            type: TYPE_INPUT,
            output_transaction_id: '1',
            output_block_id: 1,
            output_transaction_index: inOut.index,
            output_transaction_hash: inOut.hash,
            asset_id: inOut.asset,
            value: inOut.value.toString(),
            address_id: inOut.address,
          }),
        );
    }),
  );

  const references = await Promise.all([
    Block.query(db)
      .context(context.makeQueryContext())
      .insertAndFetch(data.createBlockModel({ id: 1 })),
    Block.query(db)
      .context(context.makeQueryContext())
      .insertAndFetch(data.createBlockModel({ id: 2 })),
  ]);

  return { references };
};

const secondaryInit = async (db: Knex) => {
  const context = makeContext({ db });

  await Promise.all(
    vinOptionsSecondary.map(async (inOut) => {
      await TransactionInputOutput.query(db)
        .context(context.makeQueryContext())
        .insert(
          data.createTransactionInputOutput({
            id: TransactionInputOutput.makeID({
              type: TYPE_INPUT,
              outputTransactionHash: inOut.hash,
              outputTransactionIndex: inOut.index,
            }),
            type: TYPE_INPUT,
            output_transaction_id: '2',
            output_block_id: 2,
            output_transaction_index: inOut.index,
            output_transaction_hash: inOut.hash,
            asset_id: inOut.asset,
            value: inOut.value.toString(),
            address_id: inOut.address,
          }),
        );
    }),
  );
};

const getReversions = (references: ReadonlyArray<Block>) => ({
  blockModel: references[1],
});

// tslint:disable-next-line:no-unused
const utilOptions: UpdaterUtilTestOptions<TransactionsSave, TransactionsRevert, ReadonlyArray<Block>> = {
  name: `Transactions Updater`,
  initiateTest,
  secondaryInit,
  createUpdater: () => new TransactionsUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

// test('skip', () => {
//   expect(utilOptions).toBeDefined();
// });
updaterUnitTest(utilOptions);

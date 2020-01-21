import { TransactionInputOutput } from '@neotracker/server-db';
import Knex from 'knex';
import { InputRevert, InputSave, InputUpdater } from '../../../db/InputUpdater';
import { data, makeContext } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const inputOptions: ReadonlyArray<{
  readonly id: string;
  readonly transactionID: string;
  readonly transactionHash: string;
  readonly blockIndex: number;
}> = [
  {
    id: '1',
    transactionID: '0',
    transactionHash: '1'.repeat(64),
    blockIndex: 10,
  },
  {
    id: '2',
    transactionID: '1',
    transactionHash: '2'.repeat(64),
    blockIndex: 11,
  },
];

const initiateTest = async (db: Knex) => {
  const context = makeContext({ db });

  const references = await Promise.all(
    inputOptions.map((input) =>
      TransactionInputOutput.query(db)
        .context(context.makeQueryContext())
        .insertAndFetch(
          data.createTransactionInputOutput({
            id: input.id,
            output_block_id: input.blockIndex,
            output_transaction_hash: input.transactionHash,
            output_transaction_id: input.transactionID,
          }),
        ),
    ),
  );

  return { references };
};

const getInputs = (references: ReadonlyArray<TransactionInputOutput>): InputSave => ({
  reference: references[0],
  transactionID: inputOptions[0].transactionID,
  transactionHash: inputOptions[0].transactionHash,
  blockIndex: inputOptions[0].blockIndex,
});

const getSecondaryInputs = (references: ReadonlyArray<TransactionInputOutput>): InputSave => ({
  reference: references[1],
  transactionID: inputOptions[1].transactionID,
  transactionHash: inputOptions[1].transactionHash,
  blockIndex: inputOptions[1].blockIndex,
});

const getReversions = (references: ReadonlyArray<TransactionInputOutput>): InputRevert => ({
  reference: references[1],
});

const utilOptions: UpdaterUtilTestOptions<InputSave, InputRevert, ReadonlyArray<TransactionInputOutput>> = {
  name: 'Input Updater',
  initiateTest,
  createUpdater: () => new InputUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

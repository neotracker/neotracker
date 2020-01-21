import { TransactionInputOutput } from '@neotracker/server-db';
import Knex from 'knex';
import { InputsRevert, InputsSave, InputsUpdater } from '../../../db/InputsUpdater';
import { data, makeContext } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const inputOptions: ReadonlyArray<{
  readonly transactionID: string;
  readonly transactionHash: string;
  readonly blockIndex: number;
}> = [
  {
    transactionID: '12341234',
    transactionHash: '7f48028c38117ac9e42c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e045c',
    blockIndex: 10,
  },
  {
    transactionID: '23452345',
    transactionHash: '7f48028c38117ac9e42c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e045c',
    blockIndex: 10,
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
            id: input.transactionID,
            output_block_id: input.blockIndex,
            output_transaction_hash: input.transactionHash,
            output_transaction_id: input.transactionID,
          }),
        ),
    ),
  );

  return { references };
};

const getInputs = (references: ReadonlyArray<TransactionInputOutput>): InputsSave => ({
  transactions: references.slice(0, 1).map((ref) => ({
    inputs: [ref],
    transactionID: ref.output_transaction_id,
    transactionHash: ref.output_transaction_hash,
  })),
  blockIndex: 10,
});

const getSecondaryInputs = (references: ReadonlyArray<TransactionInputOutput>): InputsSave => ({
  transactions: references.slice(1).map((ref) => ({
    inputs: [ref],
    transactionID: ref.output_transaction_id,
    transactionHash: ref.output_transaction_hash,
  })),
  blockIndex: 10,
});

const getReversions = (references: ReadonlyArray<TransactionInputOutput>): InputsRevert => ({
  references: references.slice(1),
});

const utilOptions: UpdaterUtilTestOptions<InputsSave, InputsRevert, ReadonlyArray<TransactionInputOutput>> = {
  name: `Inputs Updater`,
  initiateTest,
  createUpdater: () => new InputsUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

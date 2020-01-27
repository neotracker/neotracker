import { SUBTYPE_CLAIM, TransactionInputOutput } from '@neotracker/server-db';
import Knex from 'knex';
import { ClaimsRevert, ClaimsSave, ClaimsSaveSingle, ClaimsUpdater } from '../../../db/ClaimsUpdater';
import { data, makeContext } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const inputOptions: ReadonlyArray<{
  readonly transactionID: string;
  readonly transactionHash: string;
  readonly blockIndex: number;
  readonly claimValue: string;
}> = [
  {
    transactionID: '1234123412341234',
    transactionHash: '7f48028c38117ac9e42c8e1f6f06ae027cdbb904eaf169bdc30c9d81694e045c',
    blockIndex: 10,
    claimValue: '7',
  },
  {
    transactionID: '2345234523452345',
    transactionHash: '7f48028c38117ac9e42c8e1f6f06ae027cdfv904eaf1a0bdc30c9d81694e045c',
    blockIndex: 10,
    claimValue: '2',
  },

  {
    transactionID: '3456345634563456',
    transactionHash: '7f48028c38117ac9e42c8e1f6f06ae027cdbb904ea17a0bdc30c4201694e045c',
    blockIndex: 10,
    claimValue: '3',
  },
  {
    transactionID: '4567456745674567',
    transactionHash: '7f48028c38117ac9e69c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e045c',
    blockIndex: 10,
    claimValue: '4',
  },
];

const initiateTest = async (db: Knex) => {
  const context = makeContext({ db });

  const references = await Promise.all(
    inputOptions.map(async (input) => ({
      claims: [
        await TransactionInputOutput.query(db)
          .context(context.makeQueryContext())
          .insertAndFetch(
            data.createTransactionInputOutput({
              id: input.transactionID,
              subtype: SUBTYPE_CLAIM,
              output_block_id: input.blockIndex,
              output_transaction_hash: input.transactionHash,
              output_transaction_id: input.transactionID,
              claim_value: input.claimValue,
            }),
          ),
      ],
      transactionID: input.transactionID,
      transactionHash: input.transactionHash,
    })),
  );

  return { references };
};

const getInputs = (references: ReadonlyArray<ClaimsSaveSingle>): ClaimsSave => ({
  transactions: references.slice(0, 2),
});

const getSecondaryInputs = (references: ReadonlyArray<ClaimsSaveSingle>): ClaimsSave => ({
  transactions: references.slice(2),
});

const getReversions = (references: ReadonlyArray<ClaimsSaveSingle>): ClaimsRevert => ({
  claims: references.slice(2).map((ref) => ref.claims[0]),
});

const utilOptions: UpdaterUtilTestOptions<ClaimsSave, ClaimsRevert, ReadonlyArray<ClaimsSaveSingle>> = {
  name: `Claims Updater`,
  initiateTest,
  createUpdater: () => new ClaimsUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

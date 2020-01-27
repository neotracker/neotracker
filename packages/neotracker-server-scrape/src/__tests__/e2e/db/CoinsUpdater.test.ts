import { Coin as CoinModel } from '@neotracker/server-db';
import Knex from 'knex';
import { CoinsSave, CoinsUpdater } from '../../../db/CoinsUpdater';
import { CoinModelChange } from '../../../types';
import { data, makeContext } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const initiateTest = async (db: Knex) => {
  const context = makeContext({ db });

  const references = await Promise.all([
    CoinModel.query(db)
      .context(context.makeQueryContext())
      .insertAndFetch(data.createCoin({ id: '1'.repeat(8) })),
  ]);

  return { references };
};

const getInputs = (references: ReadonlyArray<CoinModel>): CoinsSave => {
  const coinPatches = references.map<CoinModelChange>((ref) => ({
    type: 'patch',
    value: ref,
    patch: {
      value: '2',
    },
  }));

  const coinCreates: ReadonlyArray<CoinModelChange> = [
    {
      type: 'create',
      assetHash: `a`.repeat(64),
      value: data.createCoin({
        id: '2'.repeat(8),
        asset_id: `7f48028c38117ac9e42c8e1f6f06ae027345678901234567830c9d81694e045c`,
      }),
    },
  ];

  return { coinModelChanges: coinCreates.concat(coinPatches) };
};

const getSecondaryInputs = (): CoinsSave => {
  const coinCreates: ReadonlyArray<CoinModelChange> = [
    {
      type: 'create',
      assetHash: `b`.repeat(64),
      value: data.createCoin({
        id: '3'.repeat(8),
        asset_id: `7f48028c38117ac9e42c8e1f6f06ae027345678901234567830c9d81694e045c`,
      }),
    },
  ];

  return { coinModelChanges: coinCreates };
};

const getReversions = (): CoinsSave => ({
  coinModelChanges: [
    {
      type: 'delete',
      assetHash: `b`.repeat(64),
      id: '3'.repeat(8),
    },
  ],
});

const utilOptions: UpdaterUtilTestOptions<CoinsSave, CoinsSave, ReadonlyArray<CoinModel>> = {
  name: `Coins Updater`,
  initiateTest,
  createUpdater: () => new CoinsUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

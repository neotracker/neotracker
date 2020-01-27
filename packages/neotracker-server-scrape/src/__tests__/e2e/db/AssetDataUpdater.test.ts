import { Asset } from '@neotracker/server-db';
import BigNumber from 'bignumber.js';
import Knex from 'knex';
import { AssetsDataRevert, AssetsDataSave, AssetsDataUpdater } from '../../../db/AssetsDataUpdater';
import { data, makeContext } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const inputOptions: ReadonlyArray<Partial<Asset> & Pick<Asset, 'id'>> = [
  {
    id: `1`.repeat(40),
    issued: '30',
    transaction_count: '20',
    address_count: '15',
    transfer_count: '10',
    aggregate_block_id: 9,
  },
  {
    id: `2`.repeat(40),
    issued: '60',
    transaction_count: '20',
    address_count: '15',
    transfer_count: '10',
    aggregate_block_id: 10,
  },
];

const initiateTest = async (db: Knex) => {
  const context = makeContext({ db });

  const references = await Promise.all(
    inputOptions.map((input) =>
      Asset.query(db)
        .context(context.makeQueryContext())
        .insertAndFetch(
          data.createAsset({
            ...input,
          }),
        ),
    ),
  );

  return { references };
};

const getInputs = (): AssetsDataSave => ({
  assets: {
    ['1'.repeat(40)]: {
      issued: new BigNumber('1'),
      addressCount: 5,
      transactionCount: 5,
      transferCount: 5,
    },
  },
  blockIndex: 10,
});

const getSecondaryInputs = (): AssetsDataSave => ({
  assets: {
    ['2'.repeat(40)]: {
      issued: new BigNumber('2'),
      addressCount: 5,
      transactionCount: 5,
      transferCount: 5,
    },
  },
  blockIndex: 11,
});

const getReversions = (): AssetsDataRevert => ({
  assets: {
    ['2'.repeat(40)]: {
      issued: new BigNumber('2'),
      addressCount: 5,
      transactionCount: 5,
      transferCount: 5,
    },
  },
  blockIndex: 11,
});

const utilOptions: UpdaterUtilTestOptions<AssetsDataSave, AssetsDataRevert, ReadonlyArray<Asset>> = {
  name: `AssetData Updater`,
  initiateTest,
  createUpdater: () => new AssetsDataUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

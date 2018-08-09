import { AssetsRevert, AssetsSave, AssetsUpdater } from '../../../db/AssetsUpdater';
import { data } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const initIDs: ReadonlyArray<{ readonly id: string; readonly transaction_id: string }> = [
  {
    id: '1'.repeat(40),
    transaction_id: '1',
  },
];

const secondaryIDs: ReadonlyArray<{ readonly id: string; readonly transaction_id: string }> = [
  {
    id: '2'.repeat(40),
    transaction_id: '2',
  },
];

const getInputs = () => ({
  assets: initIDs.map((option) => data.createAsset({ ...option })),
});

const getSecondaryInputs = () => ({
  assets: secondaryIDs.map((option) => data.createAsset({ ...option })),
});

const getReversions = () => ({
  transactionIDs: secondaryIDs.map((option) => option.transaction_id),
});

const utilOptions: UpdaterUtilTestOptions<AssetsSave, AssetsRevert, undefined> = {
  name: `Assets Updater`,
  createUpdater: () => new AssetsUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

import {
  AssetToTransactionRevert,
  AssetToTransactionSave,
  AssetToTransactionUpdater,
} from '../../../db/AssetToTransactionUpdater';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const savesInit: ReadonlyArray<{
  readonly assetIDs: ReadonlyArray<string>;
  readonly transactionID: string;
}> = [
  {
    assetIDs: ['OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO', 'tttttttttttttttttttttttttttttttttttttttt'],
    transactionID: '123',
  },
];

const savesSecondary: ReadonlyArray<{
  readonly assetIDs: ReadonlyArray<string>;
  readonly transactionID: string;
}> = [
  {
    assetIDs: ['cccccccccccccccccccccccccccccccccccccccc', 'dddddddddddddddddddddddddddddddddddddddd'],
    transactionID: '234',
  },
];

const getInputs = (): AssetToTransactionSave => ({
  transactions: savesInit,
});

const getSecondaryInputs = (): AssetToTransactionSave => ({
  transactions: savesSecondary,
});

const getReversions = () => ({
  transactionIDs: ['234'],
});

const utilOptions: UpdaterUtilTestOptions<AssetToTransactionSave, AssetToTransactionRevert, undefined> = {
  name: `AssetToTransaction Updater`,
  createUpdater: () => new AssetToTransactionUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

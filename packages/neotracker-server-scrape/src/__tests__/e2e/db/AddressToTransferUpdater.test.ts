import {
  AddressToTransferRevert,
  AddressToTransferSave,
  AddressToTransferUpdater,
} from '../../../db/AddressToTransferUpdater';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const getInputs = (): AddressToTransferSave => ({
  transfers: [
    {
      addressIDs: ['APyEx5f4Zm4oCHwFWiSTaph1fPBxZacYVR'],
      transferID: '12341234',
    },
  ],
});

const getSecondaryInputs = (): AddressToTransferSave => ({
  transfers: [
    {
      addressIDs: ['GIoTx5f4Zm4oCHww38hif0vofPBxZacYRT'],
      transferID: '23452345',
    },
  ],
});

const getReversions = (): AddressToTransferRevert => ({
  transferIDs: ['23452345'],
});

const utilOptions: UpdaterUtilTestOptions<AddressToTransferSave, AddressToTransferRevert, undefined> = {
  name: `AddressToTransfer Updater`,
  createUpdater: () => new AddressToTransferUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

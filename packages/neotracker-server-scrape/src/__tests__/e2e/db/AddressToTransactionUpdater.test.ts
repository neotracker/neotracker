import {
  AddressToTransactionRevert,
  AddressToTransactionSave,
  AddressToTransactionUpdater,
} from '../../../db/AddressToTransactionUpdater';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const getInputs = (): AddressToTransactionSave => ({
  transactions: [
    {
      addressIDs: ['APyEx5f4Zm4oCHwFWiSTaph1fPBxZacYVR'],
      transactionID: '12341234',
    },
  ],
});

const getSecondaryInputs = (): AddressToTransactionSave => ({
  transactions: [
    {
      addressIDs: ['GIoTx5f4Zm4oCHww38hif0vofPBxZacYRT'],
      transactionID: '23452345',
    },
  ],
});

const getReversions = (): AddressToTransactionRevert => ({
  transactionIDs: ['23452345'],
});

const utilOptions: UpdaterUtilTestOptions<AddressToTransactionSave, AddressToTransactionRevert, undefined> = {
  name: `AddressToTransaction Updater`,
  createUpdater: () => new AddressToTransactionUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

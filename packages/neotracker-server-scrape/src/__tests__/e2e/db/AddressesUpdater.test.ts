import { AddressesRevert, AddressesSave, AddressesUpdater } from '../../../db/AddressesUpdater';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const inputOptions: ReadonlyArray<{ readonly id: string; readonly transaction_id: string }> = [
  {
    id: 'a'.repeat(34),
    transaction_id: '1234123412341234',
  },
];

const secondaryOptions: ReadonlyArray<{ readonly id: string; readonly transaction_id: string }> = [
  {
    id: 'b'.repeat(34),
    transaction_id: '2345234523452345',
  },
];

const getInputs = (): AddressesSave => ({
  addresses: inputOptions.map((input) => ({
    ...input,
    block_id: 10,
    block_time: 15,
    transaction_count: '10',
    transfer_count: '20',
    aggregate_block_id: 9,
  })),
});

const getSecondaryInputs = (): AddressesSave => ({
  addresses: secondaryOptions.map((input) => ({
    ...input,
    block_id: 11,
    block_time: 15,
    transaction_count: '10',
    transfer_count: '20',
    aggregate_block_id: 10,
  })),
});

const getReversions = (): AddressesRevert => ({
  addresses: secondaryOptions.map((input) => ({ id: input.id, transactionID: input.transaction_id })),
  blockIndex: 2,
});

const utilOptions: UpdaterUtilTestOptions<AddressesSave, AddressesRevert, undefined> = {
  name: `Addresses Updater`,
  createUpdater: () => new AddressesUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

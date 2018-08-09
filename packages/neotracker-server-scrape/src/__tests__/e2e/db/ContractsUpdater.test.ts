import { ContractsRevert, ContractsSave, ContractsUpdater } from '../../../db/ContractsUpdater';
import { data } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const initIDs: ReadonlyArray<string> = ['a'.repeat(40), 'b'.repeat(40)];

const secondaryIDs: ReadonlyArray<string> = ['c'.repeat(40), 'd'.repeat(40)];

const getInputs = (): ContractsSave => ({
  contracts: initIDs.map((ID) => data.createContract({ id: ID })),
});

const getSecondaryInputs = (): ContractsSave => ({
  contracts: secondaryIDs.map((ID) => data.createContract({ id: ID })),
});

const utilOptions: UpdaterUtilTestOptions<ContractsSave, ContractsRevert, undefined> = {
  name: `Contracts Updater`,
  createUpdater: () => new ContractsUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions: () => ({ contractIDs: secondaryIDs }),
};

updaterUnitTest(utilOptions);

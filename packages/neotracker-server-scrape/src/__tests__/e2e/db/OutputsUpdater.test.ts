import { OutputsRevert, OutputsSave, OutputsUpdater } from '../../../db/OutputsUpdater';
import { data } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const savesInit: ReadonlyArray<string> = ['1'.repeat(40), '2'.repeat(40)];

const savesSecondary: ReadonlyArray<string> = ['3'.repeat(40), '4'.repeat(40)];

const getInputs = (): OutputsSave => ({
  transactions: savesInit.map((save) => ({
    outputs: [data.createTransactionInputOutput({ id: save })],
  })),
});

const getSecondaryInputs = (): OutputsSave => ({
  transactions: savesSecondary.map((save) => ({
    outputs: [data.createTransactionInputOutput({ id: save })],
  })),
});

const getReversions = (): OutputsRevert => ({
  outputIDs: savesSecondary,
});

const utilOptions: UpdaterUtilTestOptions<OutputsSave, OutputsRevert, undefined> = {
  name: `Outputs Updater`,
  createUpdater: () => new OutputsUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

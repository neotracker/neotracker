import { ProcessedIndexUpdater } from '../../../db/ProcessedIndexUpdater';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const getInputs = (): number => 10;
const getSecondaryInputs = (): number => 11;
const getReversions = (): number => 11;

const utilOptions: UpdaterUtilTestOptions<number, number, undefined> = {
  name: `Processed Index Updater`,
  createUpdater: () => new ProcessedIndexUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);

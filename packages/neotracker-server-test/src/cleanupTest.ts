import { finalize as neoOneFinalize } from '@neo-one/utils';
import { finalize } from 'neotracker-shared-utils';

type CleanupFunc = () => Promise<void> | void;
// tslint:disable-next-line no-let
let mutableCleanupFuncs: CleanupFunc[] = [];

export const addCleanup = (func: CleanupFunc) => {
  mutableCleanupFuncs.push(func);
};

export const cleanupTest = async () => {
  const currentCleanupFuncs = mutableCleanupFuncs;
  mutableCleanupFuncs = [];
  await Promise.all(currentCleanupFuncs.map((func) => func()).concat([finalize.wait(), neoOneFinalize.wait()]));

  if (mutableCleanupFuncs.length > 0) {
    await cleanupTest();
  }
};

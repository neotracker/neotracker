export const addTeardownCleanup = (func: () => Promise<void> | void) => {
  neotracker.addTeardownCleanup(func);
};

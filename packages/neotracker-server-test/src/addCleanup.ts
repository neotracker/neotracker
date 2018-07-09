export const addCleanup = (func: () => Promise<void> | void) => {
  neotracker.addCleanup(func);
};

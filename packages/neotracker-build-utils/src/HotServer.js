/* @flow */
export type HotServer = {
  +start: () => Promise<void> | void,
  +stop: () => Promise<void> | void,
};

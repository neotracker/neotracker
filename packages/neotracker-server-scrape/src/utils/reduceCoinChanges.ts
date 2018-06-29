import { CoinChanges } from '../types';

export const reduceCoinChanges = (
  a?: CoinChanges | undefined,
  b?: CoinChanges | undefined,
): CoinChanges | undefined => {
  if (a === undefined) {
    return b;
  }

  if (b === undefined) {
    return a;
  }

  const changes = a.changes.concat(b.changes);
  if (a.transactionIndex > b.transactionIndex) {
    return {
      transactionIndex: a.transactionIndex,
      actionIndex: a.actionIndex,
      changes,
    };
  }

  if (a.transactionIndex < b.transactionIndex) {
    return {
      transactionIndex: b.transactionIndex,
      actionIndex: b.actionIndex,
      changes,
    };
  }

  if (a.actionIndex === undefined) {
    return {
      transactionIndex: b.transactionIndex,
      actionIndex: b.actionIndex,
      changes,
    };
  }

  if (b.actionIndex === undefined) {
    return {
      transactionIndex: a.transactionIndex,
      actionIndex: a.actionIndex,
      changes,
    };
  }

  if (a.actionIndex > b.transactionIndex) {
    return {
      transactionIndex: a.transactionIndex,
      actionIndex: a.actionIndex,
      changes,
    };
  }

  if (a.actionIndex < b.actionIndex) {
    return {
      transactionIndex: b.transactionIndex,
      actionIndex: b.actionIndex,
      changes,
    };
  }

  return {
    transactionIndex: a.transactionIndex,
    actionIndex: a.actionIndex,
    changes,
  };
};

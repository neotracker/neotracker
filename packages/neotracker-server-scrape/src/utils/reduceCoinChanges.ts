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

  return a.concat(b);
};

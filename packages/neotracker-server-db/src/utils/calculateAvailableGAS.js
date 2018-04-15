/* @flow */
import type BigNumber from 'bignumber.js';

import { numbers } from 'neotracker-shared-utils';

import calculateClaimValueBase from './calculateClaimValueBase';

export default (maxIndex: number): Promise<BigNumber> =>
  calculateClaimValueBase({
    getSystemFee: () => Promise.resolve(numbers.ZERO),
    coins: [
      {
        value: numbers.TOTAL_NEO,
        startHeight: 0,
        endHeight: maxIndex,
      },
    ],
  });

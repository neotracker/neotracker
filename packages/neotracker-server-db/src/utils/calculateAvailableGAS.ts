import { numbers } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import { calculateClaimValueBase } from './calculateClaimValueBase';

export const calculateAvailableGAS = async (maxIndex: number): Promise<BigNumber> =>
  calculateClaimValueBase({
    getSystemFee: async () => Promise.resolve(numbers.ZERO),
    coins: [
      {
        value: numbers.TOTAL_NEO,
        startHeight: 0,
        endHeight: maxIndex,
      },
    ],
  });

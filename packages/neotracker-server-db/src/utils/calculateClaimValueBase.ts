import { utils } from '@neo-one/node-core';
import { main } from '@neo-one/node-neo-settings';
import { numbers } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';

const bigNumberToBN = (value: BigNumber): BN => new BN(value.times(numbers.D).toString(10), 10);

const bnToBigNumber = (value: BN): BigNumber => new BigNumber(value.toString(10)).div(numbers.D);

export const calculateClaimValueBase = async ({
  getSystemFee,
  coins,
}: {
  readonly getSystemFee: (index: number) => Promise<BigNumber>;
  readonly coins: ReadonlyArray<{
    readonly value: BigNumber;
    readonly startHeight: number;
    readonly endHeight: number;
  }>;
}): Promise<BigNumber> => {
  const result = await utils.calculateClaimAmount({
    coins: coins.map((coin) => ({
      value: bigNumberToBN(coin.value),
      startHeight: coin.startHeight,
      endHeight: coin.endHeight,
    })),

    decrementInterval: main().decrementInterval,
    generationAmount: main().generationAmount,
    getSystemFee: async (index) => getSystemFee(index).then(bigNumberToBN),
  });

  return bnToBigNumber(result);
};

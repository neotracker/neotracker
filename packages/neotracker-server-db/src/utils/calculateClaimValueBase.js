/* @flow */
import BN from 'bn.js';
import BigNumber from 'bignumber.js';

import { main } from '@neo-one/node-neo-settings';
import { numbers } from 'neotracker-shared-utils';
import { utils } from '@neo-one/client-core';

const bigNumberToBN = (value: BigNumber): BN =>
  new BN(value.times(numbers.D).toString(10), 10);

const bnToBigNumber = (value: BN): BigNumber =>
  new BigNumber(value.toString(10)).div(numbers.D);

export default async ({
  getSystemFee,
  coins,
}: {|
  getSystemFee: (index: number) => Promise<BigNumber>,
  coins: Array<{|
    value: BigNumber,
    startHeight: number,
    endHeight: number,
  |}>,
|}): Promise<BigNumber> => {
  const result = await utils.calculateClaimAmount({
    coins: coins.map(coin => ({
      value: bigNumberToBN(coin.value),
      startHeight: coin.startHeight,
      endHeight: coin.endHeight,
    })),
    decrementInterval: main.decrementInterval,
    generationAmount: main.generationAmount,
    getSystemFee: (index: number) =>
      getSystemFee(index).then(res => bigNumberToBN(res)),
  });

  return bnToBigNumber(result);
};

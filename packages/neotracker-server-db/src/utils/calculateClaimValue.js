/* @flow */
import BigNumber from 'bignumber.js';
import type { Monitor } from '@neo-one/monitor';

import type { RootLoader } from '../loader';

import calculateClaimValueBase from './calculateClaimValueBase';

const createGetSystemFee = (rootLoader: RootLoader, monitor: Monitor) => async (
  indexIn: number,
): Promise<BigNumber> => {
  let block;
  let index = indexIn;
  while (block == null && index >= indexIn - 5) {
    // eslint-disable-next-line
    block = await rootLoader.blockIndexLoader.load({
      id: `${index}`,
      monitor,
    });

    if (block == null) {
      index -= 1;
    }
  }

  if (block == null) {
    throw new Error(`Unexpected Block index: ${index}`);
  }

  return new BigNumber(block.aggregated_system_fee);
};

// NOTE: This is approximate, it may be incorrect. See above - we guard against
//       possible db sync differences by using the previous aggregated system
//       fee
export default ({
  rootLoader,
  monitor,
  coins,
}: {|
  rootLoader: RootLoader,
  monitor: Monitor,
  coins: Array<{|
    value: BigNumber,
    startHeight: number,
    endHeight: number,
  |}>,
|}): Promise<BigNumber> =>
  calculateClaimValueBase({
    getSystemFee: createGetSystemFee(rootLoader, monitor),
    coins,
  });

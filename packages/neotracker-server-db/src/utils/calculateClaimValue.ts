import BigNumber from 'bignumber.js';
import { RootLoader } from '../loader';
import { Block } from '../models';
import { calculateClaimValueBase } from './calculateClaimValueBase';

const createGetSystemFee = (rootLoader: RootLoader) => async (indexIn: number): Promise<BigNumber> => {
  let block: Block | undefined;
  let index = indexIn;
  // tslint:disable-next-line no-loop-statement
  while (block === undefined && index >= indexIn - 5) {
    // eslint-disable-next-line
    block = (await rootLoader.loaders.block.load({
      id: index,
    })) as Block | undefined;

    if (block === undefined) {
      index -= 1;
    }
  }

  if (block === undefined) {
    throw new Error(`Unexpected Block index: ${index}`);
  }

  return new BigNumber(block.aggregated_system_fee);
};

// NOTE: This is approximate, it may be incorrect. See above - we guard against
//       possible db sync differences by using the previous aggregated system
//       fee
export const calculateClaimValue = async ({
  rootLoader,
  coins,
}: {
  readonly rootLoader: RootLoader;
  readonly coins: ReadonlyArray<{
    readonly value: BigNumber;
    readonly startHeight: number;
    readonly endHeight: number;
  }>;
}): Promise<BigNumber> =>
  calculateClaimValueBase({
    getSystemFee: createGetSystemFee(rootLoader),
    coins,
  });

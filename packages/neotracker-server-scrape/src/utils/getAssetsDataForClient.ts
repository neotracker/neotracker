import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { Assets, CoinModelChange, Context, TransactionData } from '../types';
import { getAssetsData } from './getAssetsData';

const ZERO = new BigNumber('0');

export const getAssetsDataForClient = async ({
  monitor,
  context,
  transactions,
  blockIndex,
}: {
  readonly monitor: Monitor;
  readonly context: Context;
  readonly transactions: ReadonlyArray<TransactionData>;
  readonly blockIndex: number;
}): Promise<{ readonly assets: Assets; readonly coinModelChanges: ReadonlyArray<CoinModelChange> }> =>
  getAssetsData({
    monitor,
    context,
    transactions,
    fees: transactions.reduce(
      (acc, { transaction }) => acc.plus(transaction.networkFee).plus(transaction.systemFee),
      ZERO,
    ),
    blockIndex,
  });

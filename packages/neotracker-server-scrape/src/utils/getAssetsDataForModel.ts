import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { Assets, CoinModelChange, Context, TransactionModelData } from '../types';
import { getAssetsData } from './getAssetsData';

const ZERO = new BigNumber('0');

export const getAssetsDataForModel = async ({
  monitor,
  context,
  transactions,
  blockIndex,
}: {
  readonly monitor: Monitor;
  readonly context: Context;
  readonly transactions: ReadonlyArray<TransactionModelData>;
  readonly blockIndex: number;
}): Promise<{ readonly assets: Assets; readonly coinModelChanges: ReadonlyArray<CoinModelChange> }> =>
  getAssetsData({
    monitor,
    context,
    transactions,
    blockIndex,
    fees: transactions.reduce(
      (acc, { transactionModel }) =>
        acc.plus(new BigNumber(transactionModel.network_fee)).plus(new BigNumber(transactionModel.system_fee)),
      ZERO,
    ),
    negated: true,
  });

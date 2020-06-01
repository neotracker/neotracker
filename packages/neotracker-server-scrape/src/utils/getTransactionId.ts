import { ConfirmedTransaction } from '@neo-one/client-full';
import { numbers } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';

export type ModifiedConfirmedTransaction = ConfirmedTransaction & {
  readonly manualGlobalIndex?: BigNumber;
};

export const getTransactionId = (transaction: ModifiedConfirmedTransaction): string =>
  transaction.receipt.globalIndex.eq(numbers.INVALID_INDEX) && transaction.manualGlobalIndex
    ? transaction.manualGlobalIndex.toString()
    : transaction.receipt.globalIndex.toString();

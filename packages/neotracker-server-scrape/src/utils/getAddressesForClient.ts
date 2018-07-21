import { Address as AddressModel } from '@neotracker/server-db';
import { TransactionData } from '../types';
import { reduceInputOutputResultAddressIDs } from './reduceInputOutputResultAddressIDs';

export const getAddressesForClient = ({
  transactions,
  blockIndex,
  blockTime,
}: {
  readonly transactions: ReadonlyArray<TransactionData>;
  readonly blockIndex: number;
  readonly blockTime: number;
}): ReadonlyArray<Partial<AddressModel> & { readonly id: string }> =>
  Object.entries(reduceInputOutputResultAddressIDs(transactions.map(({ addressIDs }) => addressIDs))).map(
    ([hash, { startTransactionID, startTransactionHash }]) => ({
      id: hash,
      transaction_id: startTransactionID,
      transaction_hash: startTransactionHash,
      block_id: blockIndex,
      block_time: blockTime,
      transaction_count: '0',
      transfer_count: '0',
      aggregate_block_id: -1,
    }),
  );

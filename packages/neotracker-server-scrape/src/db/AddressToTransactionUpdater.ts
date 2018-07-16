import { Monitor } from '@neo-one/monitor';
import _ from 'lodash';
import { AddressToTransaction as AddressToTransactionModel } from 'neotracker-server-db';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface AddressToTransactionSaveSingle {
  readonly addressIDs: ReadonlyArray<string>;
  readonly transactionID: string;
}
export interface AddressToTransactionSave {
  readonly transactions: ReadonlyArray<AddressToTransactionSaveSingle>;
}
export interface AddressToTransactionRevert {
  readonly transactionIDs: ReadonlyArray<string>;
}

export class AddressToTransactionUpdater extends SameContextDBUpdater<
  AddressToTransactionSave,
  AddressToTransactionRevert
> {
  public async save(context: Context, monitor: Monitor, { transactions }: AddressToTransactionSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const data = _.flatMap(transactions, ({ addressIDs, transactionID }) =>
          [...new Set(addressIDs)].map((addressID) => ({
            id1: addressID,
            id2: transactionID,
          })),
        );
        await Promise.all(
          _.chunk(data, context.chunkSize).map(async (chunk) => {
            await AddressToTransactionModel.insertAll(context.db, context.makeQueryContext(span), chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_save_address_to_transaction' },
    );
  }

  public async revert(
    context: Context,
    monitor: Monitor,
    { transactionIDs }: AddressToTransactionRevert,
  ): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transactionIDs, context.chunkSize).map((chunk) =>
            AddressToTransactionModel.query(context.db)
              .context(context.makeQueryContext(span))
              .delete()
              .whereIn('id2', chunk),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_address_to_transaction' },
    );
  }
}

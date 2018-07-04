import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { AddressToTransaction as AddressToTransactionModel } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';

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

export class AddressToTransactionUpdater extends DBUpdater<AddressToTransactionSave, AddressToTransactionRevert> {
  public async save(monitor: Monitor, { transactions }: AddressToTransactionSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const data = _.flatMap(transactions, ({ addressIDs, transactionID }) =>
          [...new Set(addressIDs)].map((addressID) => ({
            id1: addressID,
            id2: transactionID,
          })),
        );
        await Promise.all(
          _.chunk(data, this.context.chunkSize).map(async (chunk) => {
            await AddressToTransactionModel.insertAll(this.context.db, this.context.makeQueryContext(span), chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_save_address_to_transaction' },
    );
  }

  public async revert(monitor: Monitor, { transactionIDs }: AddressToTransactionRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transactionIDs, this.context.chunkSize).map((chunk) =>
            AddressToTransactionModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .delete()
              .whereIn('id2', chunk),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_address_to_transaction' },
    );
  }
}

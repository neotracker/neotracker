import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import {
  Address as AddressModel,
  AddressToTransaction as AddressToTransactionModel,
  transaction,
} from 'neotracker-server-db';
import { raw } from 'objection';
import { DBUpdater } from './DBUpdater';
import { isUniqueError } from './utils';

export interface AddressToTransactionSaveSingle {
  readonly addressIDs: ReadonlyArray<string>;
  readonly transactionID: string;
}
export interface AddressToTransactionSave {
  readonly transactions: ReadonlyArray<AddressToTransactionSaveSingle>;
}

export class AddressToTransactionUpdater extends DBUpdater<AddressToTransactionSave, AddressToTransactionSave> {
  public async save(monitor: Monitor, { transactions }: AddressToTransactionSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transactions, this.context.chunkSize).map(async (chunk) => {
            const data = _.flatMap(chunk, ({ addressIDs, transactionID }) =>
              [...new Set(addressIDs)].map((addressID) => ({
                id1: addressID,
                id2: transactionID,
              })),
            );
            const countAndAddressIDs = Object.entries(
              _.groupBy(
                Object.entries(_.groupBy(data, ({ id1 }) => id1)),
                // tslint:disable-next-line no-unused
                ([_addressID, datas]) => `${datas.length}`,
              ),
            ).map<[number, ReadonlyArray<string>]>(([count, values]) => [
              parseInt(count, 10),
              values.map(([addressID]) => addressID),
            ]);
            try {
              await transaction(this.context.db, async (trx) => {
                await Promise.all([
                  AddressToTransactionModel.query(trx)
                    .context(this.context.makeQueryContext(span))
                    .insert(data),
                  Promise.all(
                    countAndAddressIDs.map(([count, addressIDs]) =>
                      AddressModel.query(trx)
                        .context(this.context.makeQueryContext(span))
                        .whereIn('id', [...new Set(addressIDs)])
                        .patch({
                          // tslint:disable-next-line no-any
                          transaction_count: raw(`transaction_count + ${count}`) as any,
                        }),
                    ),
                  ),
                ]);
              });
            } catch (error) {
              if (!isUniqueError(this.context.db.client.driverName, error)) {
                throw error;
              }
            }
          }),
        );
      },
      { name: 'neotracker_scrape_save_address_to_transaction' },
    );
  }

  public async revert(monitor: Monitor, { transactions }: AddressToTransactionSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          transactions.map(async ({ addressIDs: addressIDsIn, transactionID }) => {
            const addressIDs = [...new Set(addressIDsIn)];
            await transaction(this.context.db, async (trx) => {
              const deleted = await AddressToTransactionModel.query(trx)
                .context(this.context.makeQueryContext(span))
                .delete()
                .where('id2', transactionID);
              if (deleted > 0) {
                await AddressModel.query(trx)
                  .context(this.context.makeQueryContext(span))
                  .whereIn('id', addressIDs)
                  .patch({
                    // tslint:disable-next-line no-any
                    transaction_count: raw('transaction_count - 1') as any,
                  });
              }
            });
          }),
        );
      },
      { name: 'neotracker_scrape_revert_address_to_transaction' },
    );
  }
}

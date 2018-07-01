import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import {
  Address as AddressModel,
  AddressToTransfer as AddressToTransferModel,
  transaction,
} from 'neotracker-server-db';
import { raw } from 'objection';
import { DBUpdater } from './DBUpdater';

export interface AddressToTransferSaveSingle {
  readonly addressIDs: ReadonlyArray<string>;
  readonly transferID: string;
}
export interface AddressToTransferSave {
  readonly transfers: ReadonlyArray<AddressToTransferSaveSingle>;
}

export class AddressToTransferUpdater extends DBUpdater<AddressToTransferSave, AddressToTransferSave> {
  public async save(monitor: Monitor, { transfers }: AddressToTransferSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transfers, this.context.chunkSize).map(async (chunk) => {
            const data = _.flatMap(chunk, ({ addressIDs, transferID }) =>
              [...new Set(addressIDs)].map((addressID) => ({
                id1: addressID,
                id2: transferID,
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
                  AddressToTransferModel.query(trx)
                    .context(this.context.makeQueryContext(span))
                    .insert(data),
                  Promise.all(
                    countAndAddressIDs.map(([count, addressIDs]) =>
                      AddressModel.query(trx)
                        .context(this.context.makeQueryContext(span))
                        .whereIn('id', [...new Set(addressIDs)])
                        .patch({
                          // tslint:disable-next-line no-any
                          transfer_count: raw(`transfer_count + ${count}`) as any,
                        }),
                    ),
                  ),
                ]);
              });
            } catch (error) {
              if (!this.isUniqueError(error)) {
                throw error;
              }
            }
          }),
        );
      },
      { name: 'neotracker_scrape_save_address_to_transfer' },
    );
  }

  public async revert(monitor: Monitor, { transfers }: AddressToTransferSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          transfers.map(async ({ addressIDs: addressIDsIn, transferID }) => {
            const addressIDs = [...new Set(addressIDsIn)];
            await transaction(this.context.db, async (trx) => {
              const deleted = await AddressToTransferModel.query(trx)
                .context(this.context.makeQueryContext(span))
                .delete()
                .where('id2', transferID);
              if (deleted > 0) {
                await AddressModel.query(trx)
                  .context(this.context.makeQueryContext(span))
                  .whereIn('id', addressIDs)
                  .patch({
                    // tslint:disable-next-line no-any
                    transfer_count: raw('transfer_count - 1') as any,
                  });
              }
            });
          }),
        );
      },
      { name: 'neotracker_scrape_revert_address_to_transfer' },
    );
  }
}

import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { AddressToTransfer as AddressToTransferModel } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';

export interface AddressToTransferSaveSingle {
  readonly addressIDs: ReadonlyArray<string>;
  readonly transferID: string;
}
export interface AddressToTransferSave {
  readonly transfers: ReadonlyArray<AddressToTransferSaveSingle>;
}
export interface AddressToTransferRevert {
  readonly transferIDs: ReadonlyArray<string>;
}

export class AddressToTransferUpdater extends DBUpdater<AddressToTransferSave, AddressToTransferRevert> {
  public async save(monitor: Monitor, { transfers }: AddressToTransferSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const data = _.flatMap(transfers, ({ addressIDs, transferID }) =>
          [...new Set(addressIDs)].map((addressID) => ({
            id1: addressID,
            id2: transferID,
          })),
        );
        await Promise.all(
          _.chunk(data, this.context.chunkSize).map(async (chunk) => {
            await AddressToTransferModel.insertAll(this.context.db, this.context.makeQueryContext(span), chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_save_address_to_transfer' },
    );
  }

  public async revert(monitor: Monitor, { transferIDs }: AddressToTransferRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transferIDs, this.context.chunkSize).map(async (chunk) => {
            await AddressToTransferModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .delete()
              .whereIn('id2', chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_revert_address_to_transfer' },
    );
  }
}

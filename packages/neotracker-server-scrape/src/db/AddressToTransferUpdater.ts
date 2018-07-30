import { Monitor } from '@neo-one/monitor';
import { AddressToTransfer as AddressToTransferModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

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

export class AddressToTransferUpdater extends SameContextDBUpdater<AddressToTransferSave, AddressToTransferRevert> {
  public async save(context: Context, monitor: Monitor, { transfers }: AddressToTransferSave): Promise<void> {
    return monitor.captureSpanLog(
      async (span) => {
        const data = _.flatMap(transfers, ({ addressIDs, transferID }) =>
          [...new Set(addressIDs)].map((addressID) => ({
            id1: addressID,
            id2: transferID,
          })),
        );
        await Promise.all(
          _.chunk(data, context.chunkSize).map(async (chunk) => {
            await AddressToTransferModel.insertAll(context.db, context.makeQueryContext(span), chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_save_address_to_transfer', level: 'verbose', error: {} },
    );
  }

  public async revert(context: Context, monitor: Monitor, { transferIDs }: AddressToTransferRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transferIDs, context.chunkSize).map(async (chunk) => {
            await AddressToTransferModel.query(context.db)
              .context(context.makeQueryContext(span))
              .delete()
              .whereIn('id2', chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_revert_address_to_transfer' },
    );
  }
}

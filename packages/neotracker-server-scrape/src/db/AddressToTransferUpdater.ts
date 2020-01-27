import { createChild, serverLogger } from '@neotracker/logger';
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

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class AddressToTransferUpdater extends SameContextDBUpdater<AddressToTransferSave, AddressToTransferRevert> {
  public async save(context: Context, { transfers }: AddressToTransferSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_address_to_transfer' });
    const data = _.flatMap(transfers, ({ addressIDs, transferID }) =>
      [...new Set(addressIDs)].map((addressID) => ({
        id1: addressID,
        id2: transferID,
      })),
    );
    await Promise.all(
      _.chunk(data, context.chunkSize).map(async (chunk) => {
        await AddressToTransferModel.insertAll(context.db, context.makeQueryContext(), chunk);
      }),
    );
  }

  public async revert(context: Context, { transferIDs }: AddressToTransferRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_address_to_transfer' });
    await Promise.all(
      _.chunk(transferIDs, context.chunkSize).map(async (chunk) => {
        await AddressToTransferModel.query(context.db)
          .context(context.makeQueryContext())
          .delete()
          .whereIn('id2', chunk);
      }),
    );
  }
}

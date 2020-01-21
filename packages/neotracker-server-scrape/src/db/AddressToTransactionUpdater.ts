import { createChild, serverLogger } from '@neotracker/logger';
import { AddressToTransaction as AddressToTransactionModel } from '@neotracker/server-db';
import _ from 'lodash';
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

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class AddressToTransactionUpdater extends SameContextDBUpdater<
  AddressToTransactionSave,
  AddressToTransactionRevert
> {
  public async save(context: Context, { transactions }: AddressToTransactionSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_address_to_transaction' });
    const data = _.flatMap(transactions, ({ addressIDs, transactionID }) =>
      [...new Set(addressIDs)].map((addressID) => ({
        id1: addressID,
        id2: transactionID,
      })),
    );
    await Promise.all(
      _.chunk(data, context.chunkSize).map(async (chunk) => {
        await AddressToTransactionModel.insertAll(context.db, context.makeQueryContext(), chunk);
      }),
    );
  }

  public async revert(context: Context, { transactionIDs }: AddressToTransactionRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_address_to_transaction' });
    await Promise.all(
      _.chunk(transactionIDs, context.chunkSize).map((chunk) =>
        AddressToTransactionModel.query(context.db)
          .context(context.makeQueryContext())
          .delete()
          .whereIn('id2', chunk),
      ),
    );
  }
}

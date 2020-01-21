import { createChild, serverLogger } from '@neotracker/logger';
import { AssetToTransaction as AssetToTransactionModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface AssetToTransactionSaveSingle {
  readonly assetIDs: ReadonlyArray<string>;
  readonly transactionID: string;
}
export interface AssetToTransactionSave {
  readonly transactions: ReadonlyArray<AssetToTransactionSaveSingle>;
}
export interface AssetToTransactionRevert {
  readonly transactionIDs: ReadonlyArray<string>;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class AssetToTransactionUpdater extends SameContextDBUpdater<AssetToTransactionSave, AssetToTransactionRevert> {
  public async save(context: Context, { transactions }: AssetToTransactionSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_asset_to_transaction' });
    const data = _.flatMap(transactions, ({ assetIDs, transactionID }) =>
      [...new Set(assetIDs)].map((assetID) => ({
        id1: assetID,
        id2: transactionID,
      })),
    );
    await Promise.all(
      _.chunk(data, context.chunkSize).map(async (chunk) => {
        await AssetToTransactionModel.insertAll(context.db, context.makeQueryContext(), chunk);
      }),
    );
  }

  public async revert(context: Context, { transactionIDs }: AssetToTransactionRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_asset_to_transaction' });
    await Promise.all(
      _.chunk(transactionIDs, context.chunkSize).map((chunk) =>
        AssetToTransactionModel.query(context.db)
          .context(context.makeQueryContext())
          .delete()
          .whereIn('id2', chunk),
      ),
    );
  }
}

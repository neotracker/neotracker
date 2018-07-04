import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { AssetToTransaction as AssetToTransactionModel } from 'neotracker-server-db';
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

export class AssetToTransactionUpdater extends SameContextDBUpdater<AssetToTransactionSave, AssetToTransactionRevert> {
  public async save(context: Context, monitor: Monitor, { transactions }: AssetToTransactionSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const data = _.flatMap(transactions, ({ assetIDs, transactionID }) =>
          [...new Set(assetIDs)].map((assetID) => ({
            id1: assetID,
            id2: transactionID,
          })),
        );
        await Promise.all(
          _.chunk(data, context.chunkSize).map(async (chunk) => {
            await AssetToTransactionModel.insertAll(context.db, context.makeQueryContext(span), chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_save_asset_to_transaction' },
    );
  }

  public async revert(context: Context, monitor: Monitor, { transactionIDs }: AssetToTransactionRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transactionIDs, context.chunkSize).map(async (chunk) => {
            await AssetToTransactionModel.query(context.db)
              .context(context.makeQueryContext(span))
              .delete()
              .whereIn('id2', chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_revert_asset_to_transaction' },
    );
  }
}

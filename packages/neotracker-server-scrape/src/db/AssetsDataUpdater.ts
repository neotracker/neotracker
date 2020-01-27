import { createChild, serverLogger } from '@neotracker/logger';
import { Asset as AssetModel } from '@neotracker/server-db';
import { raw } from 'objection';
import { Assets, Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface AssetsDataSave {
  readonly assets: Assets;
  readonly blockIndex: number;
}
export interface AssetsDataRevert {
  readonly assets: Assets;
  readonly blockIndex: number;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class AssetsDataUpdater extends SameContextDBUpdater<AssetsDataSave, AssetsDataRevert> {
  public async save(context: Context, { assets, blockIndex }: AssetsDataSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_assets' });
    await Promise.all(
      Object.entries(assets).map(async ([asset, { issued, transactionCount, addressCount, transferCount }]) => {
        await AssetModel.query(context.db)
          .context(context.makeQueryContext())
          .where('id', asset)
          .where('aggregate_block_id', '<', blockIndex)
          .patch({
            // tslint:disable no-any
            issued: raw(`issued + (${issued.toString()})`) as any,
            transaction_count: raw(`transaction_count + ${transactionCount}`) as any,
            address_count: raw(`address_count + ${addressCount}`) as any,
            transfer_count: raw(`transfer_count + ${transferCount}`) as any,
            // tslint:enable no-any
            aggregate_block_id: blockIndex,
          });
      }),
    );
  }

  public async revert(context: Context, { assets, blockIndex }: AssetsDataRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_assets' });
    await Promise.all(
      Object.entries(assets).map(async ([asset, { issued, transactionCount, addressCount, transferCount }]) => {
        await AssetModel.query(context.db)
          .context(context.makeQueryContext())
          .where('id', asset)
          .where('aggregate_block_id', '>=', blockIndex)
          .patch({
            // tslint:disable no-any
            issued: raw(`issued - (${issued.toString()})`) as any,
            transaction_count: raw(`transaction_count - ${transactionCount}`) as any,
            address_count: raw(`address_count - ${addressCount}`) as any,
            transfer_count: raw(`transfer_count - ${transferCount}`) as any,
            // tslint:enable no-any
            aggregate_block_id: blockIndex - 1,
          });
      }),
    );
  }
}

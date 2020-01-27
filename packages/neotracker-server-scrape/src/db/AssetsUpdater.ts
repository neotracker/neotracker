import { createChild, serverLogger } from '@neotracker/logger';
import { Asset as AssetModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface AssetsSave {
  readonly assets: ReadonlyArray<Partial<AssetModel>>;
}
export interface AssetsRevert {
  readonly transactionIDs: ReadonlyArray<string>;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class AssetsUpdater extends SameContextDBUpdater<AssetsSave, AssetsRevert> {
  public async save(context: Context, { assets }: AssetsSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_assets' });
    await Promise.all(
      _.chunk(assets, context.chunkSize).map(async (chunk) =>
        AssetModel.insertAll(context.db, context.makeQueryContext(), chunk),
      ),
    );
  }

  public async revert(context: Context, { transactionIDs }: AssetsRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_assets' });
    await Promise.all(
      _.chunk(transactionIDs, context.chunkSize).map(async (chunk) =>
        AssetModel.query(context.db)
          .context(context.makeQueryContext())
          .whereIn('transaction_id', chunk)
          .delete(),
      ),
    );
  }
}

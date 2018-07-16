import { Monitor } from '@neo-one/monitor';
import _ from 'lodash';
import { Asset as AssetModel } from 'neotracker-server-db';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface AssetsSave {
  readonly assets: ReadonlyArray<Partial<AssetModel>>;
}
export interface AssetsRevert {
  readonly transactionIDs: ReadonlyArray<string>;
}

export class AssetsUpdater extends SameContextDBUpdater<AssetsSave, AssetsRevert> {
  public async save(context: Context, monitor: Monitor, { assets }: AssetsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(assets, context.chunkSize).map(async (chunk) =>
            AssetModel.insertAll(context.db, context.makeQueryContext(span), chunk),
          ),
        );
      },
      { name: 'neotracker_scrape_save_assets' },
    );
  }

  public async revert(context: Context, monitor: Monitor, { transactionIDs }: AssetsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transactionIDs, context.chunkSize).map(async (chunk) =>
            AssetModel.query(context.db)
              .context(context.makeQueryContext(span))
              .whereIn('transaction_id', chunk)
              .delete(),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_assets' },
    );
  }
}

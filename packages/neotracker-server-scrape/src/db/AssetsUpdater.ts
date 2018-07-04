import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { Asset as AssetModel } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';

export interface AssetsSave {
  readonly assets: ReadonlyArray<Partial<AssetModel>>;
}
export interface AssetsRevert {
  readonly transactionIDs: ReadonlyArray<string>;
}

export class AssetsUpdater extends DBUpdater<AssetsSave, AssetsRevert> {
  public async save(monitor: Monitor, { assets }: AssetsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(assets, this.context.chunkSize).map(async (chunk) =>
            AssetModel.insertAll(this.context.db, this.context.makeQueryContext(span), chunk),
          ),
        );
      },
      { name: 'neotracker_scrape_save_assets' },
    );
  }

  public async revert(monitor: Monitor, { transactionIDs }: AssetsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transactionIDs, this.context.chunkSize).map(async (chunk) =>
            AssetModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .whereIn('transaction_id', chunk)
              .delete(),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_assets' },
    );
  }
}

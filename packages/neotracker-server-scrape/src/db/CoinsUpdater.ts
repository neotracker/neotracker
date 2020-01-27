import { createChild, serverLogger } from '@neotracker/logger';
import { Coin as CoinModel } from '@neotracker/server-db';
import _ from 'lodash';
import { CoinModelChange, Context, isCoinModelCreate, isCoinModelDelete, isCoinModelPatch } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface CoinsSave {
  readonly coinModelChanges: ReadonlyArray<CoinModelChange>;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class CoinsUpdater extends SameContextDBUpdater<CoinsSave, CoinsSave> {
  public async save(context: Context, { coinModelChanges }: CoinsSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_coins' });
    await Promise.all([
      Promise.all(
        _.chunk(coinModelChanges.filter(isCoinModelCreate), context.chunkSize).map(async (chunk) =>
          CoinModel.insertAll(context.db, context.makeQueryContext(), chunk.map(({ value }) => value)),
        ),
      ),
      Promise.all(
        _.chunk(coinModelChanges.filter(isCoinModelDelete), context.chunkSize).map(async (chunk) =>
          CoinModel.query(context.db)
            .context(context.makeQueryContext())
            .whereIn('id', chunk.map(({ id }) => id))
            .delete(),
        ),
      ),
      Promise.all(
        coinModelChanges.filter(isCoinModelPatch).map(async ({ value, patch }) =>
          value
            .$query(context.db)
            .context(context.makeQueryContext())
            .patch(patch),
        ),
      ),
    ]);
  }

  public async revert(context: Context, options: CoinsSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_coins' });
    await this.save(context, options);
  }
}

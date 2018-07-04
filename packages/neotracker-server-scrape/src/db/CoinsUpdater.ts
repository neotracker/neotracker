import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { Coin as CoinModel } from 'neotracker-server-db';
import { CoinModelChange, Context, isCoinModelCreate, isCoinModelDelete, isCoinModelPatch } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface CoinsSave {
  readonly coinModelChanges: ReadonlyArray<CoinModelChange>;
}

export class CoinsUpdater extends SameContextDBUpdater<CoinsSave, CoinsSave> {
  public async save(context: Context, monitor: Monitor, { coinModelChanges }: CoinsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all([
          _.chunk(coinModelChanges.filter(isCoinModelCreate), context.chunkSize).map(async (chunk) =>
            CoinModel.insertAll(context.db, context.makeQueryContext(span), chunk.map(({ value }) => value)),
          ),
          _.chunk(coinModelChanges.filter(isCoinModelDelete), context.chunkSize).map(async (chunk) =>
            CoinModel.query(context.db)
              .context(context.makeQueryContext(span))
              .whereIn('id', chunk.map(({ id }) => id))
              .delete(),
          ),
          Promise.all(
            coinModelChanges.filter(isCoinModelPatch).map(async ({ value, patch }) =>
              value
                .$query(context.db)
                .context(context.makeQueryContext(span))
                .patch(patch),
            ),
          ),
        ]);
      },
      { name: 'neotracker_scrape_save_coins' },
    );
  }

  public async revert(context: Context, monitor: Monitor, options: CoinsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await this.save(context, span, options);
      },
      { name: 'neotracker_scrape_revert_coins' },
    );
  }
}

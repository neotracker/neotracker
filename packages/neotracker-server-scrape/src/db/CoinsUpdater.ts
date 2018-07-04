import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { Coin as CoinModel } from 'neotracker-server-db';
import { CoinModelChange, isCoinModelCreate, isCoinModelDelete, isCoinModelPatch } from '../types';
import { DBUpdater } from './DBUpdater';

export interface CoinsSave {
  readonly coinModelChanges: ReadonlyArray<CoinModelChange>;
}

export class CoinsUpdater extends DBUpdater<CoinsSave, CoinsSave> {
  public async save(monitor: Monitor, { coinModelChanges }: CoinsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all([
          _.chunk(coinModelChanges.filter(isCoinModelCreate), this.context.chunkSize).map(async (chunk) =>
            CoinModel.insertAll(this.context.db, this.context.makeQueryContext(span), chunk.map(({ value }) => value)),
          ),
          _.chunk(coinModelChanges.filter(isCoinModelDelete), this.context.chunkSize).map(async (chunk) =>
            CoinModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .whereIn('id', chunk.map(({ id }) => id))
              .delete(),
          ),
          Promise.all(
            coinModelChanges.filter(isCoinModelPatch).map(async ({ value, patch }) =>
              value
                .$query(this.context.db)
                .context(this.context.makeQueryContext(span))
                .patch(patch),
            ),
          ),
        ]);
      },
      { name: 'neotracker_scrape_save_coins' },
    );
  }

  public async revert(monitor: Monitor, options: CoinsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await this.save(span, options);
      },
      { name: 'neotracker_scrape_revert_coins' },
    );
  }
}

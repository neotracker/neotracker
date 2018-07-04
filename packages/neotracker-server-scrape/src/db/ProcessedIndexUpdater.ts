import { Monitor } from '@neo-one/monitor';
import { isUniqueError, ProcessedIndex } from 'neotracker-server-db';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export class ProcessedIndexUpdater extends SameContextDBUpdater<number, number> {
  public async save(context: Context, monitor: Monitor, index: number): Promise<void> {
    await monitor.captureSpan(
      async (span) => {
        try {
          await ProcessedIndex.query(context.db)
            .context(context.makeQueryContext(span))
            .insert({ index });

          await context.processedIndexPubSub.next({ index });
        } catch (error) {
          if (!isUniqueError(context.db, error)) {
            throw error;
          }
        }
      },
      { name: 'neotracker_scrape_save_processed_index' },
    );
  }

  public async revert(context: Context, monitor: Monitor, index: number): Promise<void> {
    await monitor.captureSpan(
      async (span) => {
        await ProcessedIndex.query(context.db)
          .context(context.makeQueryContext(span))
          .where('index', '>=', index)
          .delete();

        await this.save(context, span, index - 1);
      },
      { name: 'neotracker_scrape_revert_processed_index' },
    );
  }
}

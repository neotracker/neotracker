import { Monitor } from '@neo-one/monitor';
import { ProcessedIndex } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';
import { isUniqueError } from './utils';

export class ProcessedIndexUpdater extends DBUpdater<number, number> {
  public async save(monitor: Monitor, index: number): Promise<void> {
    await monitor.captureSpan(
      async (span) => {
        try {
          await ProcessedIndex.query(this.context.db)
            .context(this.context.makeQueryContext(span))
            .insert({ index });

          await this.context.processedIndexPubSub.next({ index });
        } catch (error) {
          if (!isUniqueError(this.context.db.client.driverName, error)) {
            throw error;
          }
        }
      },
      { name: 'neotracker_scrape_save_processed_index' },
    );
  }

  public async revert(monitor: Monitor, index: number): Promise<void> {
    await monitor.captureSpan(
      async (span) => {
        await ProcessedIndex.query(this.context.db)
          .context(this.context.makeQueryContext(span))
          .where('index', '>=', index)
          .delete();

        await this.save(span, index - 1);
      },
      { name: 'neotracker_scrape_revert_processed_index' },
    );
  }
}

import { createChild, serverLogger } from '@neotracker/logger';
import { isUniqueError, ProcessedIndex } from '@neotracker/server-db';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class ProcessedIndexUpdater extends SameContextDBUpdater<number, number> {
  public async save(context: Context, index: number): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_processed_index' });
    try {
      await ProcessedIndex.query(context.db)
        .context(context.makeQueryContext())
        .insert({ index });

      await context.processedIndexPubSub.next({ index });
    } catch (error) {
      if (!isUniqueError(context.db, error)) {
        throw error;
      }
    }
  }

  public async revert(context: Context, index: number): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_processed_index' });
    await ProcessedIndex.query(context.db)
      .context(context.makeQueryContext())
      .where('index', '>=', index)
      .delete();

    await this.save(context, index - 1);
  }
}

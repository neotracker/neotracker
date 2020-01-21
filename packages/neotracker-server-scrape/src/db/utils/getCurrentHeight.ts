import { createChild, serverLogger } from '@neotracker/logger';
import { ProcessedIndex } from '@neotracker/server-db';
import { Context } from '../../types';

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

async function getCurrentHeightWorker(context: Context): Promise<number> {
  serverScrapeLogger.info({ title: 'neotracker_scrape_run_get_current_height' });

  return ProcessedIndex.query(context.db)
    .context(context.makeQueryContext())
    .max('index')
    .first()
    .then((result) => {
      // Handle sqlite return
      // tslint:disable-next-line no-any
      if (result !== undefined && (result as any)['max(`index`)'] != undefined) {
        // tslint:disable-next-line no-any
        return (result as any)['max(`index`)'];
      }

      // tslint:disable-next-line no-any
      return result === undefined || (result as any).max == undefined ? -1 : (result as any).max;
    })
    .then(Number);
}

export async function getCurrentHeight(context: Context): Promise<number> {
  if (context.currentHeight !== undefined) {
    return Promise.resolve(context.currentHeight);
  }

  return getCurrentHeightWorker(context);
}

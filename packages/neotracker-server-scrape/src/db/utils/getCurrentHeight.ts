import { Monitor } from '@neo-one/monitor';
import { ProcessedIndex } from 'neotracker-server-db';
import { Context } from '../../types';

async function getCurrentHeightWorker(context: Context, monitor: Monitor): Promise<number> {
  return monitor.captureSpan(
    async (span) =>
      ProcessedIndex.query(context.db)
        .context(context.makeQueryContext(span))
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
        .then(Number),
    { name: 'neotracker_scrape_run_get_current_height' },
  );
}

export async function getCurrentHeight(context: Context, monitor: Monitor): Promise<number> {
  if (context.currentHeight !== undefined) {
    return Promise.resolve(context.currentHeight);
  }

  return getCurrentHeightWorker(context, monitor);
}

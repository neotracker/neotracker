/* @flow */
import type { Monitor } from '@neo-one/monitor';
import { PROCESSED_NEXT_INDEX } from 'neotracker-server-db';

import { type Context } from '../types';

// eslint-disable-next-line
export default async (context: Context, monitor: Monitor, checkpoint: string) =>
  monitor.at('scrape_migration_processed_next_index_notify').captureSpan(
    async span => {
      const runStatement = async (statement: string) => {
        try {
          await context.db
            .raw(statement)
            .queryContext(context.makeQueryContext(span));
        } catch (error) {
          span.logError({
            name:
              'tracker_scrape_processed_next_index_notify_run_statement_error',
            error,
          });
        }
      };

      await runStatement(`
        CREATE OR REPLACE FUNCTION processed_index_notify() RETURNS trigger AS $processed_index_notify$
          BEGIN
            NOTIFY ${PROCESSED_NEXT_INDEX};
            RETURN NULL;
          END;
        $processed_index_notify$ LANGUAGE plpgsql;
      `);
      await runStatement(`
        CREATE TRIGGER processed_index_notify AFTER INSERT
        ON processed_index FOR EACH ROW EXECUTE PROCEDURE
        processed_index_notify()
      `);
    },
    { name: 'neotracker_scrape_processed_next_index_notify_main' },
  );

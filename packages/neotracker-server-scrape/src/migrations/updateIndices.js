/* @flow */
import type { Monitor } from '@neo-one/monitor';

import { type Context } from '../types';

// eslint-disable-next-line
export default async (context: Context, monitor: Monitor, checkpoint: string) =>
  monitor.at('scrape_migration_update_indices').captureSpan(
    async span => {
      const createIndex = async (statement: string) => {
        try {
          await context.db
            .raw(statement)
            .queryContext(context.makeQueryContext(span));
        } catch (error) {
          span.logError({
            name: 'neotracker_scrape_update_indices_update_index_error',
            error,
          });
          throw error;
        }
      };

      await createIndex(
        'CREATE INDEX IF NOT EXISTS coin_address_id ON coin (address_id ASC NULLS LAST);',
      );
      await createIndex(
        'CREATE INDEX IF NOT EXISTS transfer_transaction_id ON transfer (transaction_id ASC NULLS LAST);',
      );
      await createIndex(
        'CREATE INDEX IF NOT EXISTS tio_address_id_asset_id_claim_transaction_id ON transaction_input_output (address_id ASC NULLS LAST, asset_id ASC NULLS LAST, claim_transaction_id ASC NULLS LAST);',
      );
    },
    { name: 'neotracker_scrape_update_indices_main' },
  );

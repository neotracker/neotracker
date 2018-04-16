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
        }
      };

      await createIndex(
        'CREATE INDEX transfer_transaction_id ON transfer (transaction_id DESC);',
      );
      await createIndex(
        'CREATE INDEX coin_asset_value_id ON coin (asset_id DESC, value DESC, id DESC);',
      );
      await createIndex(
        'CREATE INDEX tio_address_id_asset_id_claim_transaction_id ON transaction_input_output (address_id, asset_id, claim_transaction_id);',
      );
    },
    { name: 'neotracker_scrape_update_indices_main' },
  );

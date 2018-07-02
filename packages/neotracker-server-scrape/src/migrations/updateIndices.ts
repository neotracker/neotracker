import { Monitor } from '@neo-one/monitor';
import { isPostgres } from 'neotracker-server-db';
import { Context } from '../types';

export const updateIndices = async (context: Context, monitor: Monitor): Promise<void> => {
  const createIndex = async (statement: string) => {
    try {
      await context.db.raw(statement).queryContext(context.makeQueryContext(monitor));
    } catch (error) {
      monitor.logError({
        name: 'neotracker_scrape_update_indices_update_index_error',
        error,
      });
      throw error;
    }
  };

  if (isPostgres(context.db)) {
    await createIndex('CREATE INDEX IF NOT EXISTS coin_asset_id_value_id ON coin (asset_id ASC, value DESC, id DESC);');
  }
};

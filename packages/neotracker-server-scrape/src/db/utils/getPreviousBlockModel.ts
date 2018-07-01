import { Monitor } from '@neo-one/monitor';
import { Block as BlockModel } from 'neotracker-server-db';
import { DBContext } from '../../types';

export async function getPreviousBlockModel(
  context: DBContext,
  monitor: Monitor,
  index: number,
): Promise<BlockModel | undefined> {
  return monitor.captureSpan(
    async (span) => {
      const prevBlockModel = context.prevBlock;
      if (prevBlockModel !== undefined && prevBlockModel.id + 1 === index) {
        return prevBlockModel;
      }

      return BlockModel.query(context.db)
        .context(context.makeQueryContext(span))
        .where('id', index - 1)
        .first();
    },
    { name: 'neotracker_scrape_get_previous_block_model' },
  );
}

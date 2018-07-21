import { Monitor } from '@neo-one/monitor';
import { Block as BlockModel } from '@neotracker/server-db';
import { BlockData, Context } from '../../types';

export async function getPreviousBlockData(
  context: Context,
  monitor: Monitor,
  index: number,
): Promise<BlockData | undefined> {
  return monitor.captureSpan(
    async (span) => {
      const prevBlockData = context.prevBlockData;
      if (prevBlockData !== undefined && prevBlockData.previous_block_id + 1 === index) {
        return prevBlockData;
      }

      const blockModel = await BlockModel.query(context.db)
        .context(context.makeQueryContext(span))
        .where('id', index - 1)
        .first();
      if (blockModel === undefined) {
        return undefined;
      }

      return {
        previous_block_id: blockModel.id,
        previous_block_hash: blockModel.hash,
        validator_address_id: blockModel.next_validator_address_id,
        aggregated_system_fee: blockModel.aggregated_system_fee,
      };
    },
    { name: 'neotracker_scrape_get_previous_block_model' },
  );
}

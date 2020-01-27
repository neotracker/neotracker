import { createChild, serverLogger } from '@neotracker/logger';
import { Block as BlockModel } from '@neotracker/server-db';
import { BlockData, Context } from '../../types';

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export async function getPreviousBlockData(context: Context, index: number): Promise<BlockData | undefined> {
  serverScrapeLogger.info({ title: 'neotracker_scrape_get_previous_block_model' });
  const prevBlockData = context.prevBlockData;
  if (prevBlockData !== undefined && prevBlockData.previous_block_id + 1 === index) {
    return prevBlockData;
  }

  const blockModel = await BlockModel.query(context.db)
    .context(context.makeQueryContext())
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
}

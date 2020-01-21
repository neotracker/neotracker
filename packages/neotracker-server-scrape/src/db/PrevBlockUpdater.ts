import { Block } from '@neo-one/client-full';
import { createChild, serverLogger } from '@neotracker/logger';
import { Block as BlockModel } from '@neotracker/server-db';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface PrevBlockUpdate {
  readonly block: Block;
}
export interface PrevBlockRevert {
  readonly blockIndex: number;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class PrevBlockUpdater extends SameContextDBUpdater<PrevBlockUpdate, PrevBlockRevert> {
  public async save(context: Context, { block }: PrevBlockUpdate): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_prev_block' });
    await BlockModel.query(context.db)
      .context(context.makeQueryContext())
      .where('id', block.index - 1)
      .patch({
        next_block_id: block.index,
        next_block_hash: block.hash,
      });
  }

  public async revert(context: Context, { blockIndex }: PrevBlockRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_prev_block' });
    await BlockModel.query(context.db)
      .context(context.makeQueryContext())
      .where('id', blockIndex - 1)
      .patch({
        // tslint:disable no-null-keyword
        next_block_id: null,
        next_block_hash: null,
        // tslint:enable no-null-keyword
      });
  }
}

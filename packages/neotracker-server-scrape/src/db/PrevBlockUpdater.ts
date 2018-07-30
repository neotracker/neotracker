import { Block } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import { Block as BlockModel } from '@neotracker/server-db';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface PrevBlockUpdate {
  readonly block: Block;
}
export interface PrevBlockRevert {
  readonly blockIndex: number;
}

export class PrevBlockUpdater extends SameContextDBUpdater<PrevBlockUpdate, PrevBlockRevert> {
  public async save(context: Context, monitor: Monitor, { block }: PrevBlockUpdate): Promise<void> {
    return monitor.captureSpanLog(
      async (span) => {
        await BlockModel.query(context.db)
          .context(context.makeQueryContext(span))
          .where('id', block.index - 1)
          .patch({
            next_block_id: block.index,
            next_block_hash: block.hash,
          });
      },
      { name: 'neotracker_scrape_save_prev_block', level: 'verbose', error: {} },
    );
  }

  public async revert(context: Context, monitor: Monitor, { blockIndex }: PrevBlockRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await BlockModel.query(context.db)
          .context(context.makeQueryContext(span))
          .where('id', blockIndex - 1)
          .patch({
            // tslint:disable no-null-keyword
            next_block_id: null,
            next_block_hash: null,
            // tslint:enable no-null-keyword
          });
      },
      { name: 'neotracker_scrape_revert_prev_block' },
    );
  }
}

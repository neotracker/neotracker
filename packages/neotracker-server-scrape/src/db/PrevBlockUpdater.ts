import { Block } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import { Block as BlockModel } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';

export interface PrevBlockUpdate {
  readonly block: Block;
  readonly prevBlockModel: BlockModel | undefined;
}

export class PrevBlockUpdater extends DBUpdater<PrevBlockUpdate, BlockModel | undefined> {
  public async save(monitor: Monitor, { block, prevBlockModel }: PrevBlockUpdate): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        if (prevBlockModel !== undefined) {
          await prevBlockModel
            .$query(this.context.db)
            .context(this.context.makeQueryContext(span))
            .patch({
              next_block_id: block.index,
              next_block_hash: block.hash,
            });
        }
      },
      { name: 'neotracker_scrape_save_prev_block' },
    );
  }

  public async revert(monitor: Monitor, prevBlockModel: BlockModel | undefined): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        if (prevBlockModel !== undefined) {
          await prevBlockModel
            .$query(this.context.db)
            .context(this.context.makeQueryContext(span))
            .patch({
              // tslint:disable no-null-keyword
              next_block_id: null,
              next_block_hash: null,
              // tslint:enable no-null-keyword
            });
        }
      },
      { name: 'neotracker_scrape_revert_prev_block' },
    );
  }
}

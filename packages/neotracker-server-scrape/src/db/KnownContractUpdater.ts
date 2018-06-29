import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { KnownContract } from 'neotracker-server-db';
import { isActionProcessed } from '../utils';
import { DBUpdater } from './DBUpdater';

export interface KnownContractUpdate {
  readonly id: string;
  readonly blockIndex: number;
  readonly globalActionIndex: BigNumber;
}

export class KnownContractUpdater extends DBUpdater<KnownContractUpdate, KnownContractUpdate> {
  public async save(monitor: Monitor, { id, blockIndex, globalActionIndex }: KnownContractUpdate): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const knownContract = await KnownContract.query(this.context.db)
          .context(this.context.makeQueryContext(span))
          .where('id', id)
          .first()
          .throwIfNotFound();
        if (
          !isActionProcessed(
            { blockIndex, globalIndex: globalActionIndex },
            {
              blockIndex: knownContract.processed_block_index,
              globalIndex: new BigNumber(knownContract.processed_action_global_index),
            },
          )
        ) {
          await knownContract
            .$query(this.context.db)
            .context(this.context.makeQueryContext(span))
            .patch({
              processed_block_index: blockIndex,
              processed_action_global_index: globalActionIndex.toString(),
            });
        }
      },
      { name: 'neotracker_scrape_save_known_contract' },
    );
  }

  public async revert(monitor: Monitor, { id, blockIndex, globalActionIndex }: KnownContractUpdate): Promise<void> {
    await this.save(monitor, {
      id,
      blockIndex: globalActionIndex.lte(0) ? blockIndex - 1 : blockIndex,
      globalActionIndex: globalActionIndex.lte(0) ? new BigNumber(-1) : globalActionIndex.minus(1),
    });
  }
}

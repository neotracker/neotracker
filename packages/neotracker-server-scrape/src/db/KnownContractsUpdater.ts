import { Monitor } from '@neo-one/monitor';
import { KnownContract } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';

export interface KnownContractsUpdate {
  readonly contractIDs: ReadonlyArray<string>;
  readonly blockIndex: number;
}

export class KnownContractsUpdater extends DBUpdater<KnownContractsUpdate, KnownContractsUpdate> {
  public async save(monitor: Monitor, { contractIDs, blockIndex }: KnownContractsUpdate): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await KnownContract.query(this.context.db)
          .context(this.context.makeQueryContext(span))
          .whereIn('id', [...contractIDs])
          .patch({ processed_block_index: blockIndex, processed_action_global_index: '-1' });
      },
      { name: 'neotracker_scrape_save_known_contracts' },
    );
  }

  public async revert(monitor: Monitor, { contractIDs, blockIndex }: KnownContractsUpdate): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await KnownContract.query(this.context.db)
          .context(this.context.makeQueryContext(span))
          .whereIn('id', [...contractIDs])
          .patch({ processed_block_index: blockIndex - 1, processed_action_global_index: '-1' });
      },
      { name: 'neotracker_scrape_revert_known_contracts' },
    );
  }
}

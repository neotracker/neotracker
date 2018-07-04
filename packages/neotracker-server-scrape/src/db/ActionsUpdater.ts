import { ActionRaw } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { Action as ActionModel } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';

export interface ActionsSaveSingle {
  readonly action: ActionRaw;
  readonly transactionID: string;
  readonly transactionHash: string;
}
export interface ActionsSave {
  readonly actions: ReadonlyArray<ActionsSaveSingle>;
}
export interface ActionsRevert {
  readonly transactionIDs: ReadonlyArray<string>;
}

export class ActionsUpdater extends DBUpdater<ActionsSave, ActionsRevert> {
  public async save(monitor: Monitor, { actions }: ActionsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(actions, this.context.chunkSize).map(async (chunk) =>
            ActionModel.insertAll(
              this.context.db,
              this.context.makeQueryContext(span),
              chunk.map(({ action, transactionID, transactionHash }) => ({
                id: action.globalIndex.toString(),
                type: action.type,
                block_id: action.blockIndex,
                transaction_id: transactionID,
                transaction_hash: transactionHash,
                transaction_index: action.transactionIndex,
                index: action.index,
                script_hash: action.scriptHash,
                // tslint:disable no-any no-null-keyword
                message: (action as any).message === undefined ? null : encodeURIComponent((action as any).message),
                args_raw: (action as any).args === undefined ? null : JSON.stringify((action as any).args),
                // tslint:disable-enable no-any no-null-keyword
              })),
            ),
          ),
        );
      },
      { name: 'neotracker_scrape_save_actions' },
    );
  }

  public async revert(monitor: Monitor, { transactionIDs }: ActionsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transactionIDs, this.context.chunkSize).map(async (chunk) =>
            ActionModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .whereIn('transaction_id', chunk)
              .delete(),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_actions' },
    );
  }
}

import { addressToScriptHash, RawAction } from '@neo-one/client-full';
import { createChild, serverLogger } from '@neotracker/logger';
import { Action as ActionModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context } from '../types';
import { strip0x } from '../utils';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface ActionsSaveSingle {
  readonly action: RawAction;
  readonly transactionID: string;
  readonly transactionHash: string;
}
export interface ActionsSave {
  readonly actions: ReadonlyArray<ActionsSaveSingle>;
}
export interface ActionsRevert {
  readonly transactionIDs: ReadonlyArray<string>;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class ActionsUpdater extends SameContextDBUpdater<ActionsSave, ActionsRevert> {
  public async save(context: Context, { actions }: ActionsSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_actions' });
    await Promise.all(
      _.chunk(actions, context.chunkSize).map(async (chunk) =>
        ActionModel.insertAll(
          context.db,
          context.makeQueryContext(),
          chunk.map(({ action, transactionID, transactionHash }) => ({
            id: action.globalIndex.toString(),
            type: action.type,
            block_id: action.blockIndex,
            transaction_id: transactionID,
            transaction_hash: transactionHash,
            transaction_index: action.transactionIndex,
            index: action.index,
            script_hash: strip0x(addressToScriptHash(action.address)),
            // tslint:disable no-any no-null-keyword
            message: (action as any).message === undefined ? null : encodeURIComponent((action as any).message),
            args_raw: (action as any).args === undefined ? null : JSON.stringify((action as any).args),
            // tslint:disable-enable no-any no-null-keyword
          })),
        ),
      ),
    );
  }

  public async revert(context: Context, { transactionIDs }: ActionsRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_actions' });
    await Promise.all(
      _.chunk(transactionIDs, context.chunkSize).map(async (chunk) =>
        ActionModel.query(context.db)
          .context(context.makeQueryContext())
          .whereIn('transaction_id', chunk)
          .delete(),
      ),
    );
  }
}

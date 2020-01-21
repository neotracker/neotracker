import { createChild, serverLogger } from '@neotracker/logger';
import { TransactionInputOutput as TransactionInputOutputModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface OutputsSaveSingle {
  readonly outputs: ReadonlyArray<Partial<TransactionInputOutputModel>>;
}
export interface OutputsSave {
  readonly transactions: ReadonlyArray<OutputsSaveSingle>;
}
export interface OutputsRevert {
  readonly outputIDs: ReadonlyArray<string>;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class OutputsUpdater extends SameContextDBUpdater<OutputsSave, OutputsRevert> {
  public async save(context: Context, { transactions }: OutputsSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_outputs' });
    const allOutputs = _.flatMap(transactions.map(({ outputs }) => outputs));
    await Promise.all(
      _.chunk(allOutputs, context.chunkSize).map(async (chunk) => {
        await TransactionInputOutputModel.insertAll(context.db, context.makeQueryContext(), chunk);
      }),
    );
  }

  public async revert(context: Context, { outputIDs }: OutputsRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_outputs' });
    await Promise.all(
      _.chunk(outputIDs, context.chunkSize).map(async (chunk) => {
        await TransactionInputOutputModel.query(context.db)
          .context(context.makeQueryContext())
          .whereIn('id', chunk)
          .delete();
      }),
    );
  }
}

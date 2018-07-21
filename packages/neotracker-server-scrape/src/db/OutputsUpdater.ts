import { Monitor } from '@neo-one/monitor';
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
  readonly outputs: ReadonlyArray<TransactionInputOutputModel>;
}

export class OutputsUpdater extends SameContextDBUpdater<OutputsSave, OutputsRevert> {
  public async save(context: Context, monitor: Monitor, { transactions }: OutputsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const allOutputs = _.flatMap(transactions.map(({ outputs }) => outputs));

        await Promise.all(
          _.chunk(allOutputs, context.chunkSize).map(async (chunk) => {
            await TransactionInputOutputModel.insertAll(context.db, context.makeQueryContext(span), chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_save_outputs' },
    );
  }

  public async revert(context: Context, monitor: Monitor, { outputs }: OutputsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(outputs, context.chunkSize).map(async (chunk) => {
            await TransactionInputOutputModel.query(context.db)
              .context(context.makeQueryContext(span))
              .whereIn('id', chunk.map((output) => output.id))
              .delete();
          }),
        );
      },
      { name: 'neotracker_scrape_revert_outputs' },
    );
  }
}

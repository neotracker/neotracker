import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { TransactionInputOutput as TransactionInputOutputModel } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';

export interface OutputsSaveSingle {
  readonly outputs: ReadonlyArray<Partial<TransactionInputOutputModel>>;
}
export interface OutputsSave {
  readonly transactions: ReadonlyArray<OutputsSaveSingle>;
}
export interface OutputsRevert {
  readonly outputs: ReadonlyArray<TransactionInputOutputModel>;
}

export class OutputsUpdater extends DBUpdater<OutputsSave, OutputsRevert> {
  public async save(monitor: Monitor, { transactions }: OutputsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const allOutputs = _.flatMap(transactions.map(({ outputs }) => outputs));

        await Promise.all(
          _.chunk(allOutputs, this.context.chunkSize).map(async (chunk) => {
            await TransactionInputOutputModel.insertAll(this.context.db, this.context.makeQueryContext(span), chunk);
          }),
        );
      },
      { name: 'neotracker_scrape_save_outputs' },
    );
  }

  public async revert(monitor: Monitor, { outputs }: OutputsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(outputs, this.context.chunkSize).map(async (chunk) => {
            await TransactionInputOutputModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .whereIn('id', chunk.map((output) => output.id))
              .delete();
          }),
        );
      },
      { name: 'neotracker_scrape_revert_outputs' },
    );
  }
}

import { createChild, serverLogger } from '@neotracker/logger';
import { TransactionInputOutput as TransactionInputOutputModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context } from '../types';
import { InputUpdater } from './InputUpdater';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface InputsSaveSingle {
  readonly inputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly transactionID: string;
  readonly transactionHash: string;
}
export interface InputsSave {
  readonly transactions: ReadonlyArray<InputsSaveSingle>;
  readonly blockIndex: number;
}
export interface InputsRevert {
  readonly references: ReadonlyArray<TransactionInputOutputModel>;
}
export interface InputsUpdaters {
  readonly input: InputUpdater;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class InputsUpdater extends SameContextDBUpdater<InputsSave, InputsRevert> {
  private readonly updaters: InputsUpdaters;

  public constructor(
    updaters: InputsUpdaters = {
      input: new InputUpdater(),
    },
  ) {
    super();
    this.updaters = updaters;
  }

  public async save(context: Context, { transactions, blockIndex }: InputsSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_inputs' });
    await Promise.all(
      _.flatMap(transactions, ({ inputs, transactionID, transactionHash }) =>
        inputs.map(async (reference) =>
          this.updaters.input.save(context, { reference, transactionID, transactionHash, blockIndex }),
        ),
      ),
    );
  }

  public async revert(context: Context, { references }: InputsRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_inputs' });
    await Promise.all(references.map(async (reference) => this.updaters.input.revert(context, { reference })));
  }
}

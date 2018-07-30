import { Monitor } from '@neo-one/monitor';
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

  public async save(context: Context, monitor: Monitor, { transactions, blockIndex }: InputsSave): Promise<void> {
    return monitor.captureSpanLog(
      async (span) => {
        await Promise.all(
          _.flatMap(transactions, ({ inputs, transactionID, transactionHash }) =>
            inputs.map(async (reference) =>
              this.updaters.input.save(context, span, { reference, transactionID, transactionHash, blockIndex }),
            ),
          ),
        );
      },
      { name: 'neotracker_scrape_save_inputs', level: 'verbose', error: {} },
    );
  }

  public async revert(context: Context, monitor: Monitor, { references }: InputsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          references.map(async (reference) => this.updaters.input.revert(context, span, { reference })),
        );
      },
      { name: 'neotracker_scrape_revert_inputs' },
    );
  }
}

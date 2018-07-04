import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { TransactionInputOutput as TransactionInputOutputModel } from 'neotracker-server-db';
import { Context } from '../types';
import { DBUpdater } from './DBUpdater';
import { InputUpdater } from './InputUpdater';

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

export class InputsUpdater extends DBUpdater<InputsSave, InputsRevert> {
  private readonly updaters: InputsUpdaters;

  public constructor(
    context: Context,
    updaters: InputsUpdaters = {
      input: new InputUpdater(context),
    },
  ) {
    super(context);
    this.updaters = updaters;
  }

  public async save(monitor: Monitor, { transactions, blockIndex }: InputsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.flatMap(transactions, ({ inputs, transactionID, transactionHash }) =>
            inputs.map(async (reference) =>
              this.updaters.input.save(span, { reference, transactionID, transactionHash, blockIndex }),
            ),
          ),
        );
      },
      { name: 'neotracker_scrape_save_inputs' },
    );
  }

  public async revert(monitor: Monitor, { references }: InputsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(references.map(async (reference) => this.updaters.input.revert(span, { reference })));
      },
      { name: 'neotracker_scrape_revert_inputs' },
    );
  }
}

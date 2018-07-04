import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { Contract as ContractModel } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';

export interface ContractsSave {
  readonly contracts: ReadonlyArray<Partial<ContractModel>>;
}
export interface ContractsRevert {
  readonly transactionIDs: ReadonlyArray<string>;
}

export class ContractsUpdater extends DBUpdater<ContractsSave, ContractsRevert> {
  public async save(monitor: Monitor, { contracts }: ContractsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(contracts, this.context.chunkSize).map(async (chunk) =>
            ContractModel.insertAll(this.context.db, this.context.makeQueryContext(span), chunk),
          ),
        );
      },
      { name: 'neotracker_scrape_save_contracts' },
    );
  }

  public async revert(monitor: Monitor, { transactionIDs }: ContractsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transactionIDs, this.context.chunkSize).map(async (chunk) =>
            ContractModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .whereIn('transaction_id', chunk)
              .delete(),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_contracts' },
    );
  }
}

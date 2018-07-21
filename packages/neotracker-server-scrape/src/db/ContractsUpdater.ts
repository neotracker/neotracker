import { Monitor } from '@neo-one/monitor';
import { Contract as ContractModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface ContractsSave {
  readonly contracts: ReadonlyArray<Partial<ContractModel>>;
}
export interface ContractsRevert {
  readonly contractIDs: ReadonlyArray<string>;
}

export class ContractsUpdater extends SameContextDBUpdater<ContractsSave, ContractsRevert> {
  public async save(context: Context, monitor: Monitor, { contracts }: ContractsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(contracts, context.chunkSize).map(async (chunk) =>
            ContractModel.insertAll(context.db, context.makeQueryContext(span), chunk),
          ),
        );
      },
      { name: 'neotracker_scrape_save_contracts' },
    );
  }

  public async revert(context: Context, monitor: Monitor, { contractIDs }: ContractsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(contractIDs, context.chunkSize).map(async (chunk) =>
            ContractModel.query(context.db)
              .context(context.makeQueryContext(span))
              .whereIn('id', chunk)
              .delete(),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_contracts' },
    );
  }
}

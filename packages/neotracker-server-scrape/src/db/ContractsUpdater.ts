import { createChild, serverLogger } from '@neotracker/logger';
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

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class ContractsUpdater extends SameContextDBUpdater<ContractsSave, ContractsRevert> {
  public async save(context: Context, { contracts }: ContractsSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_contracts' });
    await Promise.all(
      _.chunk(contracts, context.chunkSize).map(async (chunk) =>
        ContractModel.insertAll(context.db, context.makeQueryContext(), chunk),
      ),
    );
  }

  public async revert(context: Context, { contractIDs }: ContractsRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_contracts' });
    await Promise.all(
      _.chunk(contractIDs, context.chunkSize).map(async (chunk) =>
        ContractModel.query(context.db)
          .context(context.makeQueryContext())
          .whereIn('id', chunk)
          .delete(),
      ),
    );
  }
}

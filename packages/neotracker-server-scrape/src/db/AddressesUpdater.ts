import { createChild, serverLogger } from '@neotracker/logger';
import { Address as AddressModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface AddressesSave {
  readonly addresses: ReadonlyArray<Partial<AddressModel> & { readonly id: string }>;
}
export interface AddressesRevert {
  readonly addresses: ReadonlyArray<{ readonly id: string; readonly transactionID?: string }>;
  readonly blockIndex: number;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class AddressesUpdater extends SameContextDBUpdater<AddressesSave, AddressesRevert> {
  public async save(context: Context, { addresses }: AddressesSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_addresses' });
    const existingAddressIDs = await Promise.all(
      _.chunk(addresses, context.chunkSize).map((chunk) =>
        AddressModel.query(context.db)
          .context(context.makeQueryContext())
          .whereIn('id', chunk.map(({ id }) => id)),
      ),
    ).then((result) => _.flatMap(result).map((address) => address.id));

    const existingAddressIDsSet = new Set(existingAddressIDs);
    const toCreate = addresses.filter((address) => !existingAddressIDsSet.has(address.id));

    await Promise.all(
      _.chunk(toCreate, context.chunkSize).map(async (chunk) =>
        AddressModel.insertAll(context.db, context.makeQueryContext(), chunk),
      ),
    );
  }

  public async revert(context: Context, { addresses, blockIndex }: AddressesRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_addresses' });
    const addressModels = await Promise.all(
      _.chunk(addresses, context.chunkSize).map((chunk) =>
        AddressModel.query(context.db)
          .context(context.makeQueryContext())
          .whereIn('id', chunk.map(({ id }) => id)),
      ),
    ).then((result) => _.flatMap(result));

    const addressToTransactionID = _.fromPairs(addresses.map(({ id, transactionID }) => [id, transactionID]));
    const toDelete = addressModels.filter(
      (address) =>
        (address.transaction_id == undefined && address.block_id === blockIndex) ||
        (address.transaction_id != undefined && address.transaction_id === addressToTransactionID[address.id]),
    );

    await Promise.all(
      _.chunk(toDelete, context.chunkSize).map((chunk) =>
        AddressModel.query(context.db)
          .context(context.makeQueryContext())
          .whereIn('id', chunk.map((address) => address.id))
          .delete(),
      ),
    );
  }
}

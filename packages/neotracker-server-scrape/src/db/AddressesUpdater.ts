import { Monitor } from '@neo-one/monitor';
import _ from 'lodash';
import { Address as AddressModel } from 'neotracker-server-db';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface AddressesSave {
  readonly addresses: ReadonlyArray<Partial<AddressModel> & { readonly id: string }>;
}
export interface AddressesRevert {
  readonly addresses: ReadonlyArray<{ readonly id: string; readonly transactionID?: string }>;
  readonly blockIndex: number;
}

export class AddressesUpdater extends SameContextDBUpdater<AddressesSave, AddressesRevert> {
  public async save(context: Context, monitor: Monitor, { addresses }: AddressesSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const existingAddressIDs = await Promise.all(
          _.chunk(addresses, context.chunkSize).map((chunk) =>
            AddressModel.query(context.db)
              .context(context.makeQueryContext(span))
              .whereIn('id', chunk.map(({ id }) => id)),
          ),
        ).then((result) => _.flatMap(result).map((address) => address.id));

        const existingAddressIDsSet = new Set(existingAddressIDs);
        const toCreate = addresses.filter((address) => !existingAddressIDsSet.has(address.id));

        await Promise.all(
          _.chunk(toCreate, context.chunkSize).map(async (chunk) =>
            AddressModel.insertAll(context.db, context.makeQueryContext(span), chunk),
          ),
        );
      },
      { name: 'neotracker_scrape_save_addresses' },
    );
  }

  public async revert(context: Context, monitor: Monitor, { addresses, blockIndex }: AddressesRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const addressModels = await Promise.all(
          _.chunk(addresses, context.chunkSize).map((chunk) =>
            AddressModel.query(context.db)
              .context(context.makeQueryContext(span))
              .whereIn('id', chunk.map(({ id }) => id)),
          ),
        ).then((result) => _.flatMap(result));

        const addressToTransactionID = _.fromPairs(addresses.map(({ id, transactionID }) => [id, transactionID]));
        const toDelete = addressModels.filter(
          (address) =>
            (address.transaction_id === undefined && address.block_id === blockIndex) ||
            (address.transaction_id !== undefined && address.transaction_id === addressToTransactionID[address.id]),
        );

        await Promise.all(
          _.chunk(toDelete, context.chunkSize).map((chunk) =>
            AddressModel.query(context.db)
              .context(context.makeQueryContext(span))
              .whereIn('id', chunk.map((address) => address.id))
              .delete(),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_addresses' },
    );
  }
}

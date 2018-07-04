import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { Address as AddressModel } from 'neotracker-server-db';
import { DBUpdater } from './DBUpdater';

export interface AddressesSave {
  readonly addresses: ReadonlyArray<Partial<AddressModel> & { readonly id: string }>;
}
export interface AddressesRevert {
  readonly addresses: ReadonlyArray<{ readonly id: string; readonly transactionID?: string }>;
  readonly blockIndex: number;
}

export class AddressesUpdater extends DBUpdater<AddressesSave, AddressesRevert> {
  public async save(monitor: Monitor, { addresses }: AddressesSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const existingAddressIDs = await Promise.all(
          _.chunk(addresses, this.context.chunkSize).map((chunk) =>
            AddressModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .whereIn('id', chunk.map(({ id }) => id)),
          ),
        ).then((result) => _.flatMap(result).map((address) => address.id));

        const existingAddressIDsSet = new Set(existingAddressIDs);
        const toCreate = addresses.filter((address) => !existingAddressIDsSet.has(address.id));

        await Promise.all(
          _.chunk(toCreate, this.context.chunkSize).map(async (chunk) =>
            AddressModel.insertAll(this.context.db, this.context.makeQueryContext(span), chunk),
          ),
        );
      },
      { name: 'neotracker_scrape_save_addresses' },
    );
  }

  public async revert(monitor: Monitor, { addresses, blockIndex }: AddressesRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const addressModels = await Promise.all(
          _.chunk(addresses, this.context.chunkSize).map((chunk) =>
            AddressModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
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
          _.chunk(toDelete, this.context.chunkSize).map((chunk) =>
            AddressModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .whereIn('id', chunk.map((address) => address.id))
              .delete(),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_addresses' },
    );
  }
}

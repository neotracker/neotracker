import { Monitor } from '@neo-one/monitor';
import { Address as AddressModel } from '@neotracker/server-db';
import { raw } from 'objection';
import { Addresses, Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface AddressesDataSave {
  readonly addresses: Addresses;
  readonly blockIndex: number;
  readonly blockTime: number;
}
export interface AddressesDataRevert {
  readonly addresses: Addresses;
  readonly transactionIDs: ReadonlyArray<string>;
  readonly blockIndex: number;
}

export class AddressesDataUpdater extends SameContextDBUpdater<AddressesDataSave, AddressesDataRevert> {
  public async save(
    context: Context,
    monitor: Monitor,
    { addresses, blockIndex, blockTime }: AddressesDataSave,
  ): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          Object.entries(addresses).map(
            async ([address, { transactionCount, transferCount, transactionID, transactionHash }]) => {
              await AddressModel.query(context.db)
                .context(context.makeQueryContext(span))
                .where('id', address)
                .where('aggregate_block_id', '<', blockIndex)
                .patch({
                  // tslint:disable no-any
                  transaction_count: raw(`transaction_count + ${transactionCount}`) as any,
                  transfer_count: raw(`transfer_count + ${transferCount}`) as any,
                  // tslint:enable no-any
                  last_transaction_id: transactionID,
                  last_transaction_hash: transactionHash,
                  last_transaction_time: blockTime,
                  aggregate_block_id: blockIndex,
                });
            },
          ),
        );
      },
      { name: 'neotracker_scrape_save_addresses_data' },
    );
  }

  public async revert(
    context: Context,
    monitor: Monitor,
    { addresses, transactionIDs, blockIndex }: AddressesDataRevert,
  ): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          Object.entries(addresses).map(async ([address, { transactionCount, transferCount }]) => {
            await AddressModel.query(context.db)
              .context(context.makeQueryContext(span))
              .where('id', address)
              .where('aggregate_block_id', '>=', blockIndex)
              .patch({
                // tslint:disable no-any
                transaction_count: raw(`transaction_count - ${transactionCount}`) as any,
                transfer_count: raw(`transfer_count - ${transferCount}`) as any,
                // tslint:enable no-any
                aggregate_block_id: blockIndex - 1,
              });
          }),
        );

        const addressIDsSet = Object.keys(addresses);
        if (addressIDsSet.length > 0) {
          await context.db
            .raw(
              `
                UPDATE address SET
                  last_transaction_id=b.transaction_id,
                  last_transaction_hash=b.hash,
                  last_transaction_time=b.block_time
                FROM (
                  SELECT a.address_id, a.transaction_id, b.hash, b.block_time
                  FROM (
                    SELECT id1 AS address_id, MAX(id2) AS transaction_id
                    FROM address_to_transaction
                    WHERE
                      id1 IN (${addressIDsSet.map((id) => `'${id}'`).join(', ')}) AND
                      id2 NOT IN ${transactionIDs.map((id) => `'${id}'`).join(', ')}
                  ) a
                  JOIN transaction b ON
                    a.transaction_id = b.id
                ) a
                WHERE
                  address.id = a.address_id
              `,
            )
            .queryContext(context.makeQueryContext(span));
        }
      },
      { name: 'neotracker_scrape_revert_addresses_data' },
    );
  }
}

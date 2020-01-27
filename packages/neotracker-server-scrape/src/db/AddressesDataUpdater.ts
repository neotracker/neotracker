import { createChild, serverLogger } from '@neotracker/logger';
import { Address as AddressModel, isPostgres } from '@neotracker/server-db';
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

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class AddressesDataUpdater extends SameContextDBUpdater<AddressesDataSave, AddressesDataRevert> {
  public async save(context: Context, { addresses, blockIndex, blockTime }: AddressesDataSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_addresses_data' });
    await Promise.all(
      Object.entries(addresses).map(
        async ([address, { transactionCount, transferCount, transactionID, transactionHash }]) => {
          await AddressModel.query(context.db)
            .context(context.makeQueryContext())
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
  }

  public async revert(context: Context, { addresses, transactionIDs, blockIndex }: AddressesDataRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_addresses_data' });
    await Promise.all(
      Object.entries(addresses).map(async ([address, { transactionCount, transferCount }]) => {
        await AddressModel.query(context.db)
          .context(context.makeQueryContext())
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
      if (isPostgres(context.db)) {
        await context.db
          .raw(
            `
              WITH cte AS (
                SELECT a.id AS address_id, b.transaction_id, b.hash, b.block_time
                FROM address a
                LEFT OUTER JOIN (
                  SELECT address_id, transaction_id, hash, block_time
                  FROM (
                    SELECT id1 AS address_id, MAX(id2) AS transaction_id
                    FROM address_to_transaction
                    WHERE
                      id1 IN (${addressIDsSet.map((id) => `'${id}'`).join(', ')}) AND
                      id2 NOT IN (${transactionIDs.map((id) => `'${id}'`).join(', ')})
                    GROUP BY address_to_transaction.id1
                  ) a
                  JOIN transaction b ON
                    a.transaction_id = b.id
                ) b ON
                  a.id = b.address_id
                WHERE
                  a.id IN (${addressIDsSet.map((id) => `'${id}'`).join(', ')})
              )
              UPDATE address SET
                last_transaction_id=cte.transaction_id,
                last_transaction_hash=cte.hash,
                last_transaction_time=cte.block_time
              FROM cte
              WHERE
                id = cte.address_id
              `,
          )
          .queryContext(context.makeQueryContext());
      } else {
        await context.db
          .raw(
            `
              WITH cte AS (
                SELECT a.address_id, transaction_id, hash, block_time
                FROM (
                  SELECT id1 AS address_id, MAX(id2) AS transaction_id
                  FROM address_to_transaction
                  WHERE
                    id1 IN (${addressIDsSet.map((id) => `'${id}'`).join(', ')}) AND
                    id2 NOT IN (${transactionIDs.map((id) => `'${id}'`).join(', ')})
                  GROUP BY id1
                ) a
                JOIN 'transaction' b ON
                  a.transaction_id = b.id
              )
              UPDATE address SET
                last_transaction_id=(select cte.transaction_id from cte where address_id = address.id),
                last_transaction_hash=(select cte.hash from cte where address_id = address.id),
                last_transaction_time=(select cte.block_time from cte where address_id = address.id)
              WHERE
                id IN (${addressIDsSet.map((id) => `'${id}'`).join(', ')})
                `,
          )
          .queryContext(context.makeQueryContext());
      }
    }
  }
}

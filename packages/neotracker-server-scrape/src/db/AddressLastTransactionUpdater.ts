import { Monitor } from '@neo-one/monitor';
import { DBUpdater } from './DBUpdater';

export interface AddressLastTransactionSaveSingle {
  readonly addressIDs: ReadonlyArray<string>;
  readonly transactionID: string;
  readonly transactionHash: string;
}
export interface AddressLastTransactionSave {
  readonly transactions: ReadonlyArray<AddressLastTransactionSaveSingle>;
  readonly blockTime: number;
}
export interface AddressLastTransactionRevert {
  readonly addressIDs: ReadonlyArray<string>;
  readonly transactionIDs: ReadonlyArray<string>;
}

export class AddressLastTransactionUpdater extends DBUpdater<AddressLastTransactionSave, AddressLastTransactionRevert> {
  public async save(monitor: Monitor, { transactions, blockTime }: AddressLastTransactionSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          transactions.map(async ({ addressIDs, transactionID, transactionHash }) => {
            const addressIDsSet = [...new Set(addressIDs)];
            if (addressIDsSet.length > 0) {
              await this.context.db
                .raw(
                  `
                  UPDATE address SET
                    last_transaction_id=${transactionID},
                    last_transaction_hash=?,
                    last_transaction_time=?
                  WHERE
                    address.id IN (${addressIDsSet.map((id) => `'${id}'`).join(', ')}) AND (
                      address.last_transaction_id IS NULL OR
                      address.last_transaction_id <= ${transactionID}
                    )
                `,
                  [transactionHash, blockTime],
                )
                .queryContext(this.context.makeQueryContext(span));
            }
          }),
        );
      },
      { name: 'neotracker_scrape_save_address_last_transaction' },
    );
  }

  public async revert(monitor: Monitor, { addressIDs, transactionIDs }: AddressLastTransactionRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const addressIDsSet = [...new Set(addressIDs)];
        if (addressIDsSet.length > 0) {
          await this.context.db
            .raw(
              `
                UPDATE address SET
                  last_transaction_id=b.transaction_id,
                  last_transaction_hash=b.hash,
                  last_transaction_time=b.block
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
            .queryContext(this.context.makeQueryContext(span));
        }
      },
      { name: 'neotracker_scrape_revert_address_last_transaction' },
    );
  }
}

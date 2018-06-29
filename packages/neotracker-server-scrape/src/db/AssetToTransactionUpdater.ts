import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { Asset as AssetModel, AssetToTransaction as AssetToTransactionModel, transaction } from 'neotracker-server-db';
import { raw } from 'objection';
import { DBUpdater } from './DBUpdater';
import { isUniqueError } from './utils';

export interface AssetToTransactionSaveSingle {
  readonly assetIDs: ReadonlyArray<string>;
  readonly transactionID: string;
}
export interface AssetToTransactionSave {
  readonly transactions: ReadonlyArray<AssetToTransactionSaveSingle>;
}

export class AssetToTransactionUpdater extends DBUpdater<AssetToTransactionSave, AssetToTransactionSave> {
  public async save(monitor: Monitor, { transactions }: AssetToTransactionSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transactions, this.context.chunkSize).map(async (chunk) => {
            const data = _.flatMap(chunk, ({ assetIDs, transactionID }) =>
              [...new Set(assetIDs)].map((assetID) => ({
                id1: assetID,
                id2: transactionID,
              })),
            );
            const countAndAssetIDs = Object.entries(
              _.groupBy(
                Object.entries(_.groupBy(data, ({ id1 }) => id1)),
                // tslint:disable-next-line no-unused
                ([_assetID, datas]) => `${datas.length}`,
              ),
            ).map<[number, ReadonlyArray<string>]>(([count, values]) => [
              parseInt(count, 10),
              values.map(([assetID]) => assetID),
            ]);
            try {
              await transaction(this.context.db, async (trx) => {
                await Promise.all([
                  AssetToTransactionModel.query(trx)
                    .context(this.context.makeQueryContext(span))
                    .insert(data),
                  Promise.all(
                    countAndAssetIDs.map(([count, assetIDs]) =>
                      AssetModel.query(trx)
                        .context(this.context.makeQueryContext(span))
                        .whereIn('id', [...new Set(assetIDs)])
                        .patch({
                          // tslint:disable-next-line no-any
                          transaction_count: raw(`transaction_count + ${count}`) as any,
                        }),
                    ),
                  ),
                ]);
              });
            } catch (error) {
              if (!isUniqueError(this.context.db.client.driverName, error)) {
                throw error;
              }
            }
          }),
        );
      },
      { name: 'neotracker_scrape_save_asset_to_transaction' },
    );
  }

  public async revert(monitor: Monitor, { transactions }: AssetToTransactionSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          transactions.map(async ({ assetIDs: assetIDsIn, transactionID }) => {
            const assetIDs = [...new Set(assetIDsIn)];
            await transaction(this.context.db, async (trx) => {
              const deleted = await AssetToTransactionModel.query(trx)
                .context(this.context.makeQueryContext(span))
                .delete()
                .where('id2', transactionID);
              if (deleted > 0) {
                await AssetModel.query(trx)
                  .context(this.context.makeQueryContext(span))
                  .whereIn('id', assetIDs)
                  .patch({
                    // tslint:disable-next-line no-any
                    transaction_count: raw('transaction_count - 1') as any,
                  });
              }
            });
          }),
        );
      },
      { name: 'neotracker_scrape_revert_asset_to_transaction' },
    );
  }
}

import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { Coin as CoinModel, transaction } from 'neotracker-server-db';
import { raw } from 'objection';
import { DBUpdater } from './DBUpdater';

export interface CoinSave {
  readonly addressHash: string;
  readonly assetHash: string;
  readonly blockIndex: number;
  readonly transactionIndex: number;
  readonly actionIndex: number | undefined;
  readonly value: BigNumber;
}

export interface CoinRevert {
  readonly addressHash: string;
  readonly assetHash: string;
  readonly blockIndex: number;
  readonly transactionIndex: number;
  readonly actionIndex: number | undefined;
  readonly value: BigNumber;
}

export class CoinUpdater extends DBUpdater<CoinSave, CoinRevert> {
  public async save(
    monitor: Monitor,
    { addressHash, assetHash, blockIndex, transactionIndex, actionIndex, value }: CoinSave,
  ): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const id = CoinModel.makeID({ addressHash, assetHash });

        const [coinModel, assetModel] = await Promise.all([
          CoinModel.query(this.context.db)
            .context(this.context.makeQueryContext(span))
            .where('id', id)
            .first(),
          // Guaranteed to have been created
          //  Either it was created by a previous PublishTransaction
          //  Or it was created as part of a NEP-5 contract initialization
          this.context.asset.getThrows(assetHash, span),
        ]);
        if (coinModel === undefined) {
          await transaction(this.context.db, async (trx) => {
            await Promise.all([
              CoinModel.query(trx)
                .context(this.context.makeQueryContext(span))
                .insert({
                  id,
                  address_id: addressHash,
                  asset_id: assetHash,
                  value: value.toString(),
                  block_id: blockIndex,
                  transaction_index: transactionIndex,
                  action_index: actionIndex === undefined ? -1 : actionIndex,
                }),
              assetModel
                .$query(trx)
                .context(this.context.makeQueryContext(span))
                .patch({
                  // tslint:disable-next-line no-any
                  address_count: raw('address_count + 1') as any,
                }),
            ]);
          });
        } else if (
          blockIndex > coinModel.block_id ||
          (blockIndex === coinModel.block_id &&
            coinModel.transaction_index !== -1 &&
            transactionIndex > coinModel.transaction_index) ||
          (blockIndex === coinModel.block_id &&
            transactionIndex === coinModel.transaction_index &&
            actionIndex !== undefined &&
            coinModel.action_index !== -1 &&
            actionIndex > coinModel.action_index)
        ) {
          const newValue = new BigNumber(coinModel.value).plus(value);
          if (newValue.isEqualTo(0)) {
            await transaction(this.context.db, async (trx) => {
              await Promise.all([
                coinModel
                  .$query(trx)
                  .context(this.context.makeQueryContext(span))
                  .delete(),
                assetModel
                  .$query(trx)
                  .context(this.context.makeQueryContext(span))
                  .patch({
                    // tslint:disable-next-line no-any
                    address_count: raw('address_count - 1') as any,
                  }),
              ]);
            });
          } else {
            await coinModel
              .$query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .patch({
                value: newValue.toFixed(assetModel.precision),
                block_id: blockIndex,
                transaction_index: transactionIndex,
                action_index: actionIndex === undefined ? -1 : actionIndex,
              });
          }
        }
      },
      { name: 'neotracker_scrape_save_coin' },
    );
  }

  public async revert(
    monitor: Monitor,
    { addressHash, assetHash, blockIndex, transactionIndex, actionIndex, value }: CoinRevert,
  ): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const id = CoinModel.makeID({ addressHash, assetHash });

        const [coinModel, assetModel] = await Promise.all([
          CoinModel.query(this.context.db)
            .context(this.context.makeQueryContext(span))
            .where('id', id)
            .first(),
          this.context.asset.getThrows(assetHash, span),
        ]);
        if (
          coinModel !== undefined &&
          blockIndex === coinModel.block_id &&
          (coinModel.transaction_index === -1 || transactionIndex === coinModel.transaction_index) &&
          (actionIndex === undefined || coinModel.action_index === -1 || actionIndex === coinModel.action_index)
        ) {
          const newValue = new BigNumber(coinModel.value).minus(value);
          if (newValue.isEqualTo(0)) {
            await transaction(this.context.db, async (trx) => {
              await Promise.all([
                coinModel
                  .$query(trx)
                  .context(this.context.makeQueryContext(span))
                  .delete(),
                assetModel
                  .$query(trx)
                  .context(this.context.makeQueryContext(span))
                  .patch({
                    // tslint:disable-next-line no-any
                    address_count: raw('address_count - 1') as any,
                  }),
              ]);
            });
          } else {
            await coinModel
              .$query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .patch({
                value: new BigNumber(coinModel.value).minus(value).toFixed(assetModel.precision),
                block_id: blockIndex - 1,
                transaction_index: -1,
                action_index: -1,
              });
          }
        }
      },
      { name: 'neotracker_scrape_revert_coin' },
    );
  }
}

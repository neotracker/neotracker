import { ActionRaw } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { Asset as AssetModel, Transfer as TransferModel } from 'neotracker-server-db';
import { raw, transaction, Transaction } from 'objection';
import { TransferData } from '../types';
import { DBUpdater } from './DBUpdater';
import { isUniqueError } from './utils';

const ZERO = new BigNumber('0');

export interface TransfersSaveSingle {
  readonly action: ActionRaw;
  readonly transferData: TransferData;
  readonly transactionID: string;
  readonly transactionHash: string;
  readonly transactionIndex: number;
}
export interface TransfersSave {
  readonly transactions: ReadonlyArray<TransfersSaveSingle>;
  readonly blockIndex: number;
  readonly blockTime: number;
}
export interface TransfersRevert {
  readonly transferIDs: ReadonlyArray<string>;
}

export class TransfersUpdater extends DBUpdater<TransfersSave, TransfersRevert> {
  public async save(monitor: Monitor, { transactions, blockIndex, blockTime }: TransfersSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        try {
          await Promise.all(
            _.chunk(transactions, this.context.chunkSize).map(async (chunk) => {
              await transaction(this.context.db, async (trx) => {
                await Promise.all([
                  TransferModel.query(trx)
                    .context(this.context.makeQueryContext(span))
                    .insert(
                      chunk.map(
                        ({
                          transferData: { result, value },
                          transactionID,
                          transactionHash,
                          transactionIndex,
                          action,
                        }) => ({
                          id: result.transferID,
                          transaction_id: transactionID,
                          transaction_hash: transactionHash,
                          asset_id: action.scriptHash,
                          contract_id: action.scriptHash,
                          value: value.toString(),
                          from_address_id: result.fromAddressID,
                          to_address_id: result.toAddressID,
                          block_id: blockIndex,
                          transaction_index: transactionIndex,
                          action_index: action.index,
                          block_time: blockTime,
                        }),
                      ),
                    ),
                  this.handleAssets(span, trx, chunk),
                ]);
              });
            }),
          );
        } catch (error) {
          if (!isUniqueError(this.context.db.client.driverName, error)) {
            throw error;
          }
        }
      },
      { name: 'neotracker_scrape_save_transfer' },
    );
  }

  public async revert(monitor: Monitor, { transferIDs }: TransfersRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          transferIDs.map(async (transferID) => {
            const transferModel = await TransferModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .where('id', transferID)
              .first();
            if (transferModel !== undefined) {
              await transaction(this.context.db, async (trx) => {
                await Promise.all([
                  transferModel
                    .$query(trx)
                    .context(this.context.makeQueryContext(span))
                    .delete(),
                  this.handleSingleAsset(
                    span,
                    trx,
                    transferModel.from_address_id,
                    transferModel.to_address_id,
                    transferModel.asset_id,
                    new BigNumber(transferModel.value),
                    true,
                  ),
                ]);
              });
            }
          }),
        );
      },
      { name: 'neotracker_scrape_revert_transfer' },
    );
  }

  private async handleAssets(
    monitor: Monitor,
    trx: Transaction,
    transfers: ReadonlyArray<TransfersSaveSingle>,
  ): Promise<void> {
    const transfersByAsset = _.groupBy(transfers, ({ action }) => action.scriptHash);
    await Promise.all(
      Object.entries(transfersByAsset).map(async ([asset, assetTransfers]) => {
        const issued = assetTransfers.reduce((acc, { transferData: { result, value } }) => {
          if (result.fromAddressID === undefined) {
            return acc.plus(value);
          }

          if (result.toAddressID === undefined) {
            return acc.minus(value);
          }

          return acc;
        }, ZERO);
        await this.handleAsset(monitor, trx, asset, issued, assetTransfers.length);
      }),
    );
  }

  private async handleSingleAsset(
    monitor: Monitor,
    trx: Transaction,
    fromAddressID: string | undefined,
    toAddressID: string | undefined,
    assetID: string,
    value: BigNumber,
    negative = false,
  ): Promise<void> {
    let issued = ZERO;
    if (fromAddressID === undefined) {
      issued = value;
    } else if (toAddressID === undefined) {
      issued = value.negated();
    }

    await this.handleAsset(monitor, trx, assetID, issued, 1, negative);
  }

  private async handleAsset(
    monitor: Monitor,
    trx: Transaction,
    assetID: string,
    issued: BigNumber,
    count: number,
    negative = false,
  ): Promise<void> {
    const plus = negative ? '-' : '+';
    if (issued.isEqualTo(0)) {
      await AssetModel.query(trx)
        .context(this.context.makeQueryContext(monitor))
        .where('id', assetID)
        .patch({
          // tslint:disable-next-line no-any
          transfer_count: raw(`transfer_count ${plus} ${count}`) as any,
        });
    } else {
      await AssetModel.query(trx)
        .context(this.context.makeQueryContext(monitor))
        .where('id', assetID)
        .patch({
          // tslint:disable-next-line no-any
          issued: raw(`issued ${plus} ${issued.toString()}`) as any,
          // tslint:disable-next-line no-any
          transfer_count: raw(`transfer_count ${plus} ${count}`) as any,
        });
    }
  }
}

import { ConfirmedTransaction } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import {
  Asset as AssetModel,
  SUBTYPE_CLAIM,
  SUBTYPE_ISSUE,
  SUBTYPE_REWARD,
  transaction as dbTransaction,
  TransactionInputOutput as TransactionInputOutputModel,
  TYPE_INPUT,
} from 'neotracker-server-db';
import { raw } from 'objection';
import { DBUpdater } from './DBUpdater';
import { getSubtype } from './utils';

export interface OutputsSaveSingle {
  readonly inputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly transactionID: string;
  readonly transaction: ConfirmedTransaction;
}
export interface OutputsSave {
  readonly transactions: ReadonlyArray<OutputsSaveSingle>;
  readonly blockIndex: number;
}
export interface OutputsRevert {
  readonly outputs: ReadonlyArray<TransactionInputOutputModel>;
}

interface PartialTransactionInputOutput {
  readonly subtype: string;
  readonly asset_id: string;
  readonly value: string;
}

export class OutputsUpdater extends DBUpdater<OutputsSave, OutputsRevert> {
  public async save(monitor: Monitor, { transactions, blockIndex }: OutputsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const outputs = _.flatMap(transactions, ({ transaction, inputs, transactionID }) =>
          transaction.vout.map((output, idx) => ({
            id: TransactionInputOutputModel.makeID({
              outputTransactionHash: transaction.txid,
              outputTransactionIndex: idx,
              type: TYPE_INPUT,
            }),
            type: TYPE_INPUT,
            subtype: getSubtype(output, inputs, transaction, idx),
            output_transaction_id: transactionID,
            output_transaction_hash: transaction.txid,
            output_transaction_index: idx,
            output_block_id: blockIndex,
            asset_id: output.asset,
            value: output.value.toString(),
            address_id: output.address,
          })),
        );

        await Promise.all(
          _.chunk(outputs, this.context.chunkSize).map(async (chunk) => {
            try {
              const assetAndIssued = this.getAssetAndIssued(chunk);
              await dbTransaction(this.context.db, async (trx) => {
                await Promise.all([
                  TransactionInputOutputModel.query(trx)
                    .context(this.context.makeQueryContext(span))
                    .insert(chunk),
                  Promise.all(
                    assetAndIssued.map(async ([asset, assetOutputs]) => {
                      const issued = assetOutputs.reduce((acc, { value }) => acc.plus(value), new BigNumber('0'));
                      await AssetModel.query(trx)
                        .context(this.context.makeQueryContext(span))
                        .where('id', asset)
                        .patch({
                          // tslint:disable-next-line no-any
                          issued: raw(`issued + ${issued.toString()}`) as any,
                        });
                    }),
                  ),
                ]);
              });
            } catch (error) {
              if (!this.isUniqueError(error)) {
                throw error;
              }
            }
          }),
        );
      },
      { name: 'neotracker_scrape_save_outputs' },
    );
  }

  public async revert(monitor: Monitor, { outputs }: OutputsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await dbTransaction(this.context.db, async (trx) => {
          const assetAndIssued = this.getAssetAndIssued(outputs);
          await Promise.all([
            TransactionInputOutputModel.query(trx)
              .context(this.context.makeQueryContext(span))
              .whereIn('id', outputs.map((output) => output.id))
              .delete(),
            Promise.all(
              assetAndIssued.map(async ([asset, assetOutputs]) => {
                const issued = assetOutputs.reduce((acc, { value }) => acc.plus(value), new BigNumber('0'));
                await AssetModel.query(trx)
                  .context(this.context.makeQueryContext(span))
                  .where('id', asset)
                  .patch({
                    // tslint:disable-next-line no-any
                    issued: raw(`issued - ${issued.toString()}`) as any,
                  });
              }),
            ),
          ]);
        });
      },
      { name: 'neotracker_scrape_revert_outputs' },
    );
  }

  private getAssetAndIssued(
    outputs: ReadonlyArray<PartialTransactionInputOutput>,
  ): ReadonlyArray<[string, ReadonlyArray<PartialTransactionInputOutput>]> {
    const assetAndIssued = _.groupBy(
      outputs.filter(
        (output) =>
          output.subtype === SUBTYPE_ISSUE || output.subtype === SUBTYPE_CLAIM || output.subtype === SUBTYPE_REWARD,
      ),
      ({ asset_id }) => asset_id,
    );

    return Object.entries(assetAndIssued);
  }
}

import { ActionRaw } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { Transfer as TransferModel } from 'neotracker-server-db';
import { TransferData } from '../types';
import { DBUpdater } from './DBUpdater';

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
        await Promise.all(
          _.chunk(transactions, this.context.chunkSize).map(async (chunk) => {
            await TransferModel.insertAll(
              this.context.db,
              this.context.makeQueryContext(span),
              chunk.map(
                ({ transferData: { result, value }, transactionID, transactionHash, transactionIndex, action }) => ({
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
            );
          }),
        );
      },
      { name: 'neotracker_scrape_save_transfers' },
    );
  }

  public async revert(monitor: Monitor, { transferIDs }: TransfersRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transferIDs, this.context.chunkSize).map(async (chunk) => {
            await TransferModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .whereIn('id', chunk)
              .delete();
          }),
        );
      },
      { name: 'neotracker_scrape_revert_transfers' },
    );
  }
}

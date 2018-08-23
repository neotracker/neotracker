import { addressToScriptHash, RawAction } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import { Transfer as TransferModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context, TransferData } from '../types';
import { strip0x } from '../utils';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface TransfersSaveSingle {
  readonly action: RawAction;
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

export class TransfersUpdater extends SameContextDBUpdater<TransfersSave, TransfersRevert> {
  public async save(
    context: Context,
    monitor: Monitor,
    { transactions, blockIndex, blockTime }: TransfersSave,
  ): Promise<void> {
    return monitor.captureSpanLog(
      async (span) => {
        await Promise.all(
          _.chunk(transactions, context.chunkSize).map(async (chunk) => {
            await TransferModel.insertAll(
              context.db,
              context.makeQueryContext(span),
              chunk.map(
                ({ transferData: { result, value }, transactionID, transactionHash, transactionIndex, action }) => ({
                  id: result.transferID,
                  transaction_id: transactionID,
                  transaction_hash: transactionHash,
                  asset_id: strip0x(addressToScriptHash(action.address)),
                  contract_id: strip0x(addressToScriptHash(action.address)),
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
      { name: 'neotracker_scrape_save_transfers', level: 'verbose', error: {} },
    );
  }

  public async revert(context: Context, monitor: Monitor, { transferIDs }: TransfersRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          _.chunk(transferIDs, context.chunkSize).map(async (chunk) => {
            await TransferModel.query(context.db)
              .context(context.makeQueryContext(span))
              .whereIn('id', chunk)
              .delete();
          }),
        );
      },
      { name: 'neotracker_scrape_revert_transfers' },
    );
  }
}

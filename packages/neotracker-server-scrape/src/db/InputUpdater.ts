import { Monitor } from '@neo-one/monitor';
import { TransactionInputOutput as TransactionInputOutputModel } from '@neotracker/server-db';
import { NEO_ASSET_ID } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import { Context } from '../types';
import { calculateClaimAmount } from '../utils';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface InputSave {
  readonly reference: TransactionInputOutputModel;
  readonly transactionID: string;
  readonly transactionHash: string;
  readonly blockIndex: number;
}
export interface InputRevert {
  readonly reference: TransactionInputOutputModel;
}

export class InputUpdater extends SameContextDBUpdater<InputSave, InputRevert> {
  public async save(
    context: Context,
    monitor: Monitor,
    { transactionID, transactionHash, reference, blockIndex }: InputSave,
  ): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        let claimValue = '0';
        if (reference.asset_id === `${NEO_ASSET_ID}`) {
          claimValue = await calculateClaimAmount(
            context,
            span,
            new BigNumber(reference.value),
            reference.output_block_id,
            blockIndex,
          );
        }
        await reference
          .$query(context.db)
          .context(context.makeQueryContext(span))
          .patch({
            input_transaction_id: transactionID,
            input_transaction_hash: transactionHash,
            claim_value: claimValue,
          });
      },
      { name: 'neotracker_scrape_save_input' },
    );
  }

  public async revert(context: Context, monitor: Monitor, { reference }: InputRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await reference
          .$query(context.db)
          .context(context.makeQueryContext(span))
          .patch({
            // tslint:disable no-null-keyword
            input_transaction_id: null,
            input_transaction_hash: null,
            claim_value: null,
            // tslint:enable no-null-keyword
          });
      },
      { name: 'neotracker_scrape_revert_input' },
    );
  }
}

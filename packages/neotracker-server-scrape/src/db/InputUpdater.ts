import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { TransactionInputOutput as TransactionInputOutputModel } from 'neotracker-server-db';
import { NEO_ASSET_ID } from 'neotracker-shared-utils';
import { calculateClaimAmount } from '../utils';
import { DBUpdater } from './DBUpdater';

export interface InputSave {
  readonly reference: TransactionInputOutputModel;
  readonly transactionID: string;
  readonly transactionHash: string;
  readonly blockIndex: number;
}
export interface InputRevert {
  readonly reference: TransactionInputOutputModel;
}

export class InputUpdater extends DBUpdater<InputSave, InputRevert> {
  public async save(
    monitor: Monitor,
    { transactionID, transactionHash, reference, blockIndex }: InputSave,
  ): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        let claimValue = '0';
        if (reference.asset_id === `${NEO_ASSET_ID}`) {
          claimValue = await calculateClaimAmount(
            this.context,
            span,
            new BigNumber(reference.value),
            reference.output_block_id,
            blockIndex,
          );
        }
        await reference
          .$query(this.context.db)
          .context(this.context.makeQueryContext(span))
          .patch({
            input_transaction_id: transactionID,
            input_transaction_hash: transactionHash,
            claim_value: claimValue,
          });
      },
      { name: 'neotracker_scrape_save_input' },
    );
  }

  public async revert(monitor: Monitor, { reference }: InputRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await reference
          .$query(this.context.db)
          .context(this.context.makeQueryContext(span))
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

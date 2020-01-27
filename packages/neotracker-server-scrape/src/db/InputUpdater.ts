import { createChild, serverLogger } from '@neotracker/logger';
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

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class InputUpdater extends SameContextDBUpdater<InputSave, InputRevert> {
  public async save(
    context: Context,
    { transactionID, transactionHash, reference, blockIndex }: InputSave,
  ): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_input' });
    let claimValue = '0';
    if (reference.asset_id === `${NEO_ASSET_ID}`) {
      claimValue = await calculateClaimAmount(
        context,
        new BigNumber(reference.value),
        reference.output_block_id,
        blockIndex,
      );
    }
    await reference
      .$query(context.db)
      .context(context.makeQueryContext())
      .patch({
        input_transaction_id: transactionID,
        input_transaction_hash: transactionHash,
        claim_value: claimValue,
      });
  }

  public async revert(context: Context, { reference }: InputRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_input' });
    await reference
      .$query(context.db)
      .context(context.makeQueryContext())
      .patch({
        // tslint:disable no-null-keyword
        input_transaction_id: null,
        input_transaction_hash: null,
        claim_value: null,
        // tslint:enable no-null-keyword
      });
  }
}

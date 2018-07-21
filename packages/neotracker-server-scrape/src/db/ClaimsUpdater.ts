import { Monitor } from '@neo-one/monitor';
import { TransactionInputOutput as TransactionInputOutputModel } from '@neotracker/server-db';
import _ from 'lodash';
import { Context } from '../types';
import { SameContextDBUpdater } from './SameContextDBUpdater';

export interface ClaimsSaveSingle {
  readonly claims: ReadonlyArray<TransactionInputOutputModel>;
  readonly transactionID: string;
  readonly transactionHash: string;
}
export interface ClaimsSave {
  readonly transactions: ReadonlyArray<ClaimsSaveSingle>;
}
export interface ClaimsRevert {
  readonly claims: ReadonlyArray<TransactionInputOutputModel>;
}

export class ClaimsUpdater extends SameContextDBUpdater<ClaimsSave, ClaimsRevert> {
  public async save(context: Context, monitor: Monitor, { transactions }: ClaimsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await Promise.all(
          transactions.map(async ({ claims, transactionID, transactionHash }) => {
            await this.updateClaims(context, span, claims, transactionID, transactionHash);
          }),
        );
      },
      { name: 'neotracker_scrape_save_claims' },
    );
  }

  public async revert(context: Context, monitor: Monitor, { claims }: ClaimsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        await this.updateClaims(context, span, claims);
      },
      { name: 'neotracker_scrape_revert_claims' },
    );
  }

  private async updateClaims(
    context: Context,
    monitor: Monitor,
    claims: ReadonlyArray<TransactionInputOutputModel>,
    transactionID?: string,
    transactionHash?: string,
  ): Promise<void> {
    await Promise.all(
      _.chunk(claims, context.chunkSize).map(async (chunk) => {
        await TransactionInputOutputModel.query(context.db)
          .context(context.makeQueryContext(monitor))
          .whereIn('id', chunk.map((claim) => claim.id))
          .patch({
            claim_transaction_id: transactionID,
            claim_transaction_hash: transactionHash,
          });
      }),
    );
  }
}

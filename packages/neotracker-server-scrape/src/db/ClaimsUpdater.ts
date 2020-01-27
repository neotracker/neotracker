import { createChild, serverLogger } from '@neotracker/logger';
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

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export class ClaimsUpdater extends SameContextDBUpdater<ClaimsSave, ClaimsRevert> {
  public async save(context: Context, { transactions }: ClaimsSave): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_claims' });
    await Promise.all(
      transactions.map(async ({ claims, transactionID, transactionHash }) => {
        await this.updateClaims(context, claims, transactionID, transactionHash);
      }),
    );
  }
  public async revert(context: Context, { claims }: ClaimsRevert): Promise<void> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_claims' });
    await this.updateClaims(context, claims);
  }
  private async updateClaims(
    context: Context,
    claims: ReadonlyArray<TransactionInputOutputModel>,
    transactionID?: string,
    transactionHash?: string,
  ): Promise<void> {
    await Promise.all(
      _.chunk(claims, context.chunkSize).map(async (chunk) => {
        await TransactionInputOutputModel.query(context.db)
          .context(context.makeQueryContext())
          .whereIn('id', chunk.map((claim) => claim.id))
          .patch({
            // tslint:disable-next-line no-null-keyword
            claim_transaction_id: transactionID === undefined ? null : transactionID,
            // tslint:disable-next-line no-null-keyword
            claim_transaction_hash: transactionHash === undefined ? null : transactionHash,
          });
      }),
    );
  }
}

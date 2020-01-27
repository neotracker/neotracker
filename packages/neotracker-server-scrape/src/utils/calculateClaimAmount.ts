import { createChild, serverLogger } from '@neotracker/logger';
import { calculateClaimValueBase } from '@neotracker/server-db';
import BigNumber from 'bignumber.js';
import { Context } from '../types';

const ZERO = new BigNumber('0');

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

export async function calculateClaimAmount(
  context: Context,
  value: BigNumber,
  startHeight: number,
  endHeight: number,
): Promise<string> {
  serverScrapeLogger.info({ title: 'neotracker_scrape_run_calculate_claim_amount' });
  if (value.isEqualTo(ZERO)) {
    return Promise.resolve(ZERO.toFixed(8));
  }

  return calculateClaimValueBase({
    getSystemFee: async (index) => context.systemFee.getThrows(index).then((val) => new BigNumber(val)),
    coins: [{ value, startHeight, endHeight }],
  }).then((result) => result.toFixed(8));
}

import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { calculateClaimValueBase } from 'neotracker-server-db';
import { Context } from '../types';

const ZERO = new BigNumber('0');

export async function calculateClaimAmount(
  context: Context,
  monitor: Monitor,
  value: BigNumber,
  startHeight: number,
  endHeight: number,
): Promise<string> {
  return monitor.captureSpan(
    async (span) => {
      if (value.isEqualTo(ZERO)) {
        return Promise.resolve(ZERO.toFixed(8));
      }

      return calculateClaimValueBase({
        getSystemFee: async (index) => context.systemFee.getThrows(index, span).then((val) => new BigNumber(val)),
        coins: [{ value, startHeight, endHeight }],
      }).then((result) => result.toFixed(8));
    },
    { name: 'neotracker_scrape_run_calculate_claim_amount' },
  );
}

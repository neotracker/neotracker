import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { KnownContract as KnownContractModel } from 'neotracker-server-db';
import { DBContext } from '../../types';
import { isUniqueError } from './isUniqueError';

export async function getKnownContractModel(
  context: DBContext,
  monitor: Monitor,
  hash: string,
): Promise<KnownContractModel> {
  return monitor.captureSpan(
    async (span) =>
      KnownContractModel.query(context.db)
        .context(context.makeQueryContext(span))
        .where('id', hash)
        .first()
        .then((result) => {
          if (result === undefined) {
            return KnownContractModel.query(context.db)
              .context(context.makeQueryContext(span))
              .insert({
                id: hash,
                processed_block_index: -1,
                processed_action_global_index: new BigNumber(-1).toString(),
              })
              .returning('*')
              .first()
              .throwIfNotFound()
              .catch(async (error: NodeJS.ErrnoException) => {
                if (isUniqueError(context.db, error)) {
                  return getKnownContractModel(context, span, hash);
                }
                throw error;
              });
          }

          return result;
        }),
    { name: 'neotracker_scrape_get_known_contract' },
  );
}

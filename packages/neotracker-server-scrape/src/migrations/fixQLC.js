/* @flow */
import {
  Address as AddressModel,
  Transfer as TransferModel,
} from 'neotracker-server-db';
import type { Monitor } from '@neo-one/monitor';

import { type Context } from '../types';

export default (
  context: Context,
  monitor: Monitor,
  // eslint-disable-next-line
  checkpoint: string,
) =>
  monitor.at('scrape_migration_fix_qlc').captureLog(
    async span => {
      const [transfer, correctedAddress] = await Promise.all([
        TransferModel.query(context.db)
          .context(context.makeQueryContext(span))
          .where('from_address_id', null)
          .where('to_address_id', 'ASTin8w3BjRb7nKFwPeR5dfSQYjVKGUJJL')
          .first(),
        AddressModel.query(context.db)
          .context(context.makeQueryContext(span))
          .where('id', 'ANvKJaBm2ynGMjd6Y1n2z2TcRnbwVtsaKo')
          .first(),
      ]);
      if (
        transfer == null ||
        correctedAddress == null ||
        transfer.transaction_id !==
          '4428f56f61048e504c203c6abb033ffa4ae9a3a992ca86084227d287c0175b8a'
      ) {
        throw new Error('Could not find QLC transfer');
      }

      await transfer
        .$query(context.db)
        .context(context.makeQueryContext(span))
        .patch({
          to_address_id: correctedAddress.id,
        });
    },
    { name: 'neotracker_scrape_fix_qlc' },
  );

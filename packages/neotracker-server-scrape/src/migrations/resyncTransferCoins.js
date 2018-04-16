/* @flow */
import type { Monitor } from '@neo-one/monitor';

import { type Context } from '../types';

// eslint-disable-next-line
export default async (context: Context, monitor: Monitor, checkpoint: string) =>
  monitor.at('migration_resync_transfer_coins').captureSpan(
    async span => {
      await context.db
        .raw(
          `
        UPDATE coin SET
          value=a.value
        FROM (
          SELECT
            a.address_id,
            a.asset_id,
            COALESCE(a.in, 0) - COALESCE(b.out, 0) AS value
          FROM (
            SELECT
              a.to_address_id AS address_id,
              a.asset_id,
              SUM(a.value) AS in
            FROM transfer a
            GROUP BY a.to_address_id, a.asset_id
          ) a
          FULL OUTER JOIN (
            SELECT
              a.from_address_id AS address_id,
              a.asset_id,
              SUM(a.value) AS out
            FROM transfer a
            GROUP BY a.from_address_id, a.asset_id
          ) b ON
            a.asset_id = b.asset_id AND
            a.address_id = b.address_id
        ) a
        WHERE
          coin.address_id = a.address_id AND
          coin.asset_id = a.asset_id
      `,
        )
        .queryContext(context.makeQueryContext(span));
    },
    { name: 'neotracker_scrape_resync_transfer_coins_main' },
  );

/* @flow */
import { Asset as AssetModel } from 'neotracker-server-db';
import type { Monitor } from '@neo-one/monitor';

import { abi } from '@neo-one/client';

import { type Context } from '../types';

import { add0x } from '../utils';

const THOR_HASH = '67a5086bac196b67d5fd20745b0dc9db4d2930ed';

export default (
  context: Context,
  monitor: Monitor,
  // eslint-disable-next-line
  checkpoint: string,
) =>
  monitor.at('scrape_migration_fix_thor').captureLog(
    async () => {
      const contractABI = await abi.NEP5(context.client, add0x(THOR_HASH));
      const contract = context.client.smartContract(
        add0x(THOR_HASH),
        contractABI,
      );

      const issued = await contract.totalSupply(monitor);
      await AssetModel.query(context.db)
        .context(context.makeQueryContext(monitor))
        .patch({ issued: issued.toString() })
        .where('id', THOR_HASH);
    },
    { name: 'scrape_migration_fix_thor' },
  );

/* @flow */
import { Asset as AssetModel } from 'neotracker-server-db';
import type { Monitor } from '@neo-one/monitor';

import { abi } from '@neo-one/client';

import { type Context } from '../types';

import { add0x } from '../utils';

// eslint-disable-next-line
export const fixIssued = (
  context: Context,
  monitor: Monitor,
  checkpoint: string,
  hash: string,
) =>
  monitor.at(`scrape_migration_fix_issued_${checkpoint}`).captureLog(
    async () => {
      const contractABI = await abi.NEP5(context.client, add0x(hash));
      const contract = context.client.smartContract(add0x(hash), contractABI);

      const issued = await contract.totalSupply(monitor);
      await AssetModel.query(context.db)
        .context(context.makeQueryContext(monitor))
        .patch({ issued: issued.toString() })
        .where('id', hash);
    },
    { name: `scrape_migration_fix_issued_${checkpoint}` },
  );

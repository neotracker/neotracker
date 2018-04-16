/* @flow */
import type { Context } from 'koa';

import { isHealthyDB } from 'neotracker-server-db';
import { routes } from 'neotracker-shared-web';

import { getMonitor, getRootLoader } from './common';

export type Options = {|
  maintenance: boolean,
|};

export default ({ options }: {| options: Options |}) => ({
  type: 'route',
  method: 'get',
  name: 'healthCheck',
  path: routes.HEALTH_CHECK,
  middleware: async (ctx: Context): Promise<void> => {
    if (options.maintenance) {
      ctx.status = 200;
    } else {
      const monitor = getMonitor(ctx);
      const rootLoader = getRootLoader(ctx);
      const currentHealthy = await isHealthyDB(rootLoader.db, monitor);
      if (currentHealthy) {
        ctx.status = 200;
      } else {
        ctx.status = 500;
      }
    }
  },
});

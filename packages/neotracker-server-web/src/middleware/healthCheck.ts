import { isHealthyDB } from '@neotracker/server-db';
import { getMonitor } from '@neotracker/server-utils-koa';
// @ts-ignore
import { routes } from '@neotracker/shared-web';
import { Context } from 'koa';
import { getRootLoader } from './common';
export interface Options {
  readonly maintenance: boolean;
}

export const healthCheck = ({ options }: { readonly options: Options }) => ({
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
      ctx.status = currentHealthy ? 200 : 500;
    }
  },
});

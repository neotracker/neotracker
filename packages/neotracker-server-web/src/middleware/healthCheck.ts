import { isHealthyDB } from '@neotracker/server-db';
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
      const rootLoader = getRootLoader(ctx);
      const currentHealthy = await isHealthyDB(rootLoader.db);
      ctx.status = currentHealthy ? 200 : 500;
    }
  },
});

/* @flow */
import type { Context } from 'koa';
import type { RootLoader } from 'neotracker-server-db';

import { simpleMiddleware } from 'neotracker-server-utils-koa';

export default ({ rootLoader }: {| rootLoader: RootLoader |}) =>
  simpleMiddleware(
    'context',
    async (ctx: Context, next: () => Promise<void>) => {
      ctx.state.rootLoader = rootLoader;
      await next();
    },
  );

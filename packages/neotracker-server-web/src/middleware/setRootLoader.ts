import { Context } from 'koa';
import { RootLoader } from 'neotracker-server-db';
import { simpleMiddleware } from 'neotracker-server-utils-koa';

export const setRootLoader = ({ rootLoader }: { readonly rootLoader: RootLoader }) =>
  simpleMiddleware('context', async (ctx: Context, next: (() => Promise<void>)) => {
    ctx.state.rootLoader = rootLoader;
    await next();
  });

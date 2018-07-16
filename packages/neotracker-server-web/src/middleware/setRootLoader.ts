import { Context } from 'koa';
import { RootLoader } from 'neotracker-server-db';
import { createQueryDeduplicator, QueryMap, schema } from 'neotracker-server-graphql';
import { getMonitor, simpleMiddleware } from 'neotracker-server-utils-koa';

const queryMap = new QueryMap({ next: true });
export const setRootLoader = ({ rootLoader }: { readonly rootLoader: RootLoader }) =>
  simpleMiddleware('context', async (ctx: Context, next: (() => Promise<void>)) => {
    ctx.state.rootLoader = rootLoader;
    ctx.state.queryDeduplicator = createQueryDeduplicator(getMonitor(ctx), schema(), queryMap, rootLoader);

    await next();
  });

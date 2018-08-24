import { RootLoader } from '@neotracker/server-db';
import { createQueryDeduplicator, QueryMap, schema } from '@neotracker/server-graphql';
import { getMonitor, simpleMiddleware } from '@neotracker/server-utils-koa';
import { Context } from 'koa';

export const setRootLoader = ({
  rootLoader,
  queryMap,
}: {
  readonly rootLoader: RootLoader;
  readonly queryMap: QueryMap;
}) =>
  simpleMiddleware('context', async (ctx: Context, next: (() => Promise<void>)) => {
    ctx.state.rootLoader = rootLoader;
    ctx.state.queryMap = queryMap;
    ctx.state.queryDeduplicator = createQueryDeduplicator(getMonitor(ctx), schema(), queryMap, rootLoader);

    await next();
  });

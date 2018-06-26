import { Context } from 'koa';
// @ts-ignore
import koaRatelimit from 'koa-ratelimit-lru';
import { simpleMiddleware } from 'neotracker-server-utils-koa';

export interface Options {
  readonly enabled: boolean;
  readonly config: {
    readonly rate: number;
    readonly duration: number;
    readonly throw: boolean;
  };
}

export const ratelimit = ({ options }: { readonly options: Options }) => {
  const ratelimitInstance = koaRatelimit(options.config);

  return simpleMiddleware('ratelimit', async (ctx: Context, next: (() => Promise<void>)) => {
    if (options.enabled) {
      await ratelimitInstance(ctx, next);
    } else {
      await next();
    }
  });
};

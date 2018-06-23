/* @flow */
import type { Context } from 'koa';

import ratelimit from 'koa-ratelimit-lru';
import { simpleMiddleware } from 'neotracker-server-utils-koa';

export type Options = {|
  enabled: boolean,
  config: {|
    rate: number,
    duration: number,
    throw: boolean,
  |},
|};

export default ({ options }: {| options: Options |}) => {
  const ratelimitInstance = ratelimit(options.config);
  return simpleMiddleware(
    'ratelimit',
    async (ctx: Context, next: () => Promise<void>) => {
      if (options.enabled) {
        await ratelimitInstance(ctx, next);
      } else {
        await next();
      }
    },
  );
};

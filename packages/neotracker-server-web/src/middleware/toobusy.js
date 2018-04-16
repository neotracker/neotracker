/* @flow */
import { type Context } from 'koa';

import toobusy from 'toobusy-js';

import { simpleMiddleware } from './common';

export type Options = {|
  enabled: boolean,
  userAgents: string,
  whitelistedUserAgents: string,
  maxLag: number,
  smoothingFactor: number,
|};

const configureTooBusy = (options: Options) => {
  toobusy.maxLag(options.maxLag);
  toobusy.smoothingFactor(options.smoothingFactor);
};

const toobusyMiddleware = ({ options }: {| options: Options |}) => {
  const userAgents = new RegExp(options.userAgents);
  const whitelistedUserAgents = new RegExp(options.whitelistedUserAgents);
  configureTooBusy(options);
  return simpleMiddleware(
    'toobusy',
    async (ctx: Context, next: () => Promise<void>) => {
      const userAgent = ctx.request.headers['user-agent'];
      if (
        toobusy() &&
        userAgents.test(userAgent) &&
        options.enabled &&
        !whitelistedUserAgents.test(userAgent)
      ) {
        ctx.status = 503;
        ctx.body = 'Server is too busy, try again later.';
      } else {
        await next();
      }
    },
  );
};

toobusyMiddleware.shutdown = () => toobusy.shutdown();
export default toobusyMiddleware;

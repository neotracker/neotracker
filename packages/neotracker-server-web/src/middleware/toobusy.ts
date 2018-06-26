import { Context } from 'koa';
import { simpleMiddleware } from 'neotracker-server-utils-koa';
import * as toobusyJS from 'toobusy-js';

export interface Options {
  readonly enabled: boolean;
  readonly userAgents: string;
  readonly whitelistedUserAgents: string;
  readonly maxLag: number;
  readonly smoothingFactor: number;
}

const configureTooBusy = (options: Options) => {
  toobusyJS.maxLag(options.maxLag);
  // tslint:disable-next-line no-any
  (toobusyJS as any).smoothingFactor(options.smoothingFactor);
};

function toobusyMiddleware({ options }: { readonly options: Options }) {
  const userAgents = new RegExp(options.userAgents);
  const whitelistedUserAgents = new RegExp(options.whitelistedUserAgents);
  configureTooBusy(options);

  return simpleMiddleware('toobusy', async (ctx: Context, next: (() => Promise<void>)) => {
    const userAgent = ctx.request.headers['user-agent'];
    if (toobusyJS() && userAgents.test(userAgent) && options.enabled && !whitelistedUserAgents.test(userAgent)) {
      ctx.status = 503;
      ctx.body = 'Server is too busy, try again later.';
    } else {
      await next();
    }
  });
}

namespace toobusyMiddleware {
  export const shutdown = () => toobusyJS.shutdown();
}

export const toobusy = toobusyMiddleware;

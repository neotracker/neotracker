import { simpleMiddleware } from '@neotracker/server-utils-koa';
import { Context } from 'koa';

export const redirectURL = simpleMiddleware('redirect', async (ctx: Context, next: () => Promise<void>) => {
  if (ctx.headers.host.match(/^www/) !== null) {
    ctx.redirect(`http://${ctx.headers.host.replace(/^www\./, '')}${ctx.url}`);
  } else {
    await next();
  }
});

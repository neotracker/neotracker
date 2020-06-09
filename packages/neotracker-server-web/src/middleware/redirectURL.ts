import { simpleMiddleware } from '@neotracker/server-utils-koa';
import { Context } from 'koa';

export const redirectWWWURL = simpleMiddleware('redirect', async (ctx: Context, next: () => Promise<void>) => {
  if (ctx.headers.host.match(/^www/) !== null) {
    ctx.redirect(`https://${ctx.headers.host.replace(/^www\./, '')}${ctx.url}`);
  } else {
    await next();
  }
});

export const redirectMoonPayURL = simpleMiddleware('redirect', async (ctx: Context, next: () => Promise<void>) => {
  if (ctx.query.transactionId) {
    if (ctx.query.transactionStatus === 'pending') {
      ctx.redirect(`${ctx.request.origin}/wallet`);
    } else {
      ctx.redirect(`${ctx.request.origin}/tx/${ctx.query.transactionId}`);
    }
  } else {
    await next();
  }
});

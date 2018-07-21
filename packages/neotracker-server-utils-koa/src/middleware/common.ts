import { Span } from '@neo-one/monitor';
import { HTTPError } from '@neotracker/server-utils';
import { Context, Middleware } from 'koa';

export const getMonitor = (ctx: Context): Span => {
  const { monitor } = ctx.state;
  if (monitor == undefined) {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }

  return monitor;
};
export interface ServerMiddleware {
  readonly type: 'middleware';
  readonly name: string;
  readonly middleware: Middleware;
}
export interface ServerRoute {
  readonly type: 'route';
  readonly method: 'get' | 'post';
  readonly name: string;
  readonly path: string;
  readonly middleware: Middleware;
}

export const simpleMiddleware = (name: string, middleware: Middleware): ServerMiddleware => ({
  type: 'middleware',
  name,
  middleware,
});

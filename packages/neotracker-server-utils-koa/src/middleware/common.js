/* @flow */
import type { Context, Middleware } from 'koa';
import { HTTPError } from 'neotracker-server-utils';
import type { Span } from '@neo-one/monitor';

export const getMonitor = (ctx: Context): Span => {
  const { monitor } = ctx.state;
  if (monitor == null) {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }
  return monitor;
};

export type ServerMiddleware = {|
  type: 'middleware',
  name: string,
  middleware: Middleware,
|};

export type ServerRoute = {|
  type: 'route',
  method: 'get' | 'post',
  name: string,
  path: string,
  middleware: Middleware,
|};

export const simpleMiddleware = (
  name: string,
  middleware: Middleware,
): ServerMiddleware => ({
  type: 'middleware',
  name,
  middleware,
});

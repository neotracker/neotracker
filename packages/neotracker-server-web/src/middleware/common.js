/* @flow */
import type { Context, Middleware } from 'koa';
import { HTTPError } from 'neotracker-server-utils';
import type { Span } from '@neo-one/monitor';
import { RootLoader } from 'neotracker-server-db';
import type { UserAgent } from 'neotracker-shared-utils';

export const getRootLoader = (ctx: Context): RootLoader => {
  const { rootLoader } = ctx.state;
  if (!(rootLoader instanceof RootLoader)) {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }
  return rootLoader;
};

export const getMonitor = (ctx: Context): Span => {
  const { monitor } = ctx.state;
  if (monitor == null) {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }
  return monitor;
};

export const getNonce = (ctx: Context): string => {
  const { nonce } = ctx.state;
  if (typeof nonce !== 'string') {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }
  return nonce;
};

export const getUserAgent = (ctx: Context): UserAgent => {
  const { userAgent } = ctx.state;
  if (userAgent == null) {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }

  return userAgent;
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

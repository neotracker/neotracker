/* @flow */
import type { Context } from 'koa';
import { HTTPError } from 'neotracker-server-utils';
import { RootLoader } from 'neotracker-server-db';
import type { UserAgent } from 'neotracker-shared-utils';

export const getRootLoader = (ctx: Context): RootLoader => {
  const { rootLoader } = ctx.state;
  if (!(rootLoader instanceof RootLoader)) {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }
  return rootLoader;
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

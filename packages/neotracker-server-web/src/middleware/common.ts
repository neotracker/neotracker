import { RootLoader } from '@neotracker/server-db';
import { HTTPError } from '@neotracker/server-utils';
import { QueryDeduplicator } from '@neotracker/shared-graphql';
import { Context } from 'koa';

export const getRootLoader = (ctx: Context): RootLoader => {
  const { rootLoader } = ctx.state;
  if (!(rootLoader instanceof RootLoader)) {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }

  return rootLoader;
};

export const getQueryDeduplicator = (ctx: Context): QueryDeduplicator => {
  const { queryDeduplicator } = ctx.state;
  if (!(queryDeduplicator instanceof QueryDeduplicator)) {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }

  return queryDeduplicator;
};

export const getNonce = (ctx: Context): string => {
  const { nonce } = ctx.state;
  if (typeof nonce !== 'string') {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }

  return nonce;
};

export const getUserAgent = (ctx: Context): IUAParser.IResult => {
  const { userAgent } = ctx.state;
  if (userAgent == undefined) {
    throw new HTTPError(500, HTTPError.PROGRAMMING_ERROR);
  }

  return userAgent;
};

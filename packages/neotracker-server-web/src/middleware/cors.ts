import convert from 'koa-convert';
// @ts-ignore
import koaCors from 'koa-cors';
import { simpleMiddleware } from 'neotracker-server-utils-koa';

export const cors = simpleMiddleware('cors', convert(koaCors({ origin: true })));

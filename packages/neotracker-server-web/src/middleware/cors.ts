import { simpleMiddleware } from '@neotracker/server-utils-koa';
import convert from 'koa-convert';
// @ts-ignore
import koaCors from 'koa-cors';

export const cors = simpleMiddleware('cors', convert(koaCors({ origin: '*' })));

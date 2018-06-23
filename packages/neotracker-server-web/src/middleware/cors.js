/* @flow */
import convert from 'koa-convert';
import cors from 'koa-cors';
import { simpleMiddleware } from 'neotracker-server-utils-koa';

export default simpleMiddleware('cors', convert(cors({ origin: true })));

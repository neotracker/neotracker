import body from 'koa-better-body';
import convert from 'koa-convert';

// tslint:disable-next-line no-any
export const bodyParser = (options?: any) => convert(body(options));

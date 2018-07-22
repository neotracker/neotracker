import Koa from 'koa';

interface Options {
  readonly algorithm: 'sha1';
  readonly secret: string;
}
export default function(options: Options): Koa.Middleware;

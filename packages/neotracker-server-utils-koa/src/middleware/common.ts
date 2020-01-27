import { Middleware } from 'koa';

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

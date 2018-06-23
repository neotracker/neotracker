/* @flow */
import type Koa from 'koa';
import Router from 'koa-router';

import type { ServerMiddleware, ServerRoute } from './middleware';

export default ({
  app,
  middlewares,
}: {|
  app: Koa,
  middlewares: Array<ServerMiddleware | ServerRoute>,
|}) => {
  const router = new Router();
  for (const middleware of middlewares) {
    if (middleware.type === 'route') {
      switch (middleware.method) {
        case 'get':
          router.get(middleware.name, middleware.path, middleware.middleware);
          break;
        case 'post':
          router.post(middleware.name, middleware.path, middleware.middleware);
          break;
        default:
          // eslint-disable-next-line
          (middleware.method: empty);
          throw new Error(`Unknown method ${middleware.method}`);
      }
    } else {
      router.use(middleware.middleware);
    }
  }

  app.use(router.routes());
  app.use(router.allowedMethods());
};

import Application from 'koa';
import Router from 'koa-router';
import { utils } from 'neotracker-shared-utils';
import { ServerMiddleware, ServerRoute } from './middleware';

export const routeMiddleware = ({
  app,
  middlewares,
}: {
  readonly app: Application;
  readonly middlewares: ReadonlyArray<ServerMiddleware | ServerRoute>;
}) => {
  const router = new Router();
  middlewares.forEach((middleware) => {
    if (middleware.type === 'route') {
      switch (middleware.method) {
        case 'get':
          router.get(middleware.name, middleware.path, middleware.middleware);
          break;
        case 'post':
          router.post(middleware.name, middleware.path, middleware.middleware);
          break;
        default:
          utils.assertNever(middleware.method);
          throw new Error(`Unknown method ${middleware.method}`);
      }
    } else {
      router.use(middleware.middleware);
    }
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
};

import { utils } from '@neotracker/shared-utils';
import Application from 'koa';
import Router from 'koa-router';
import { ServerMiddleware, ServerRoute } from './middleware';

export const routeMiddleware = ({
  app,
  middlewares,
  cors,
}: {
  readonly app: Application;
  readonly middlewares: ReadonlyArray<ServerMiddleware | ServerRoute>;
  readonly cors?: ServerMiddleware;
}) => {
  // tslint:disable-next-line: no-any
  const router = new Router<any, {}>();
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
  if (cors !== undefined) {
    app.use(cors.middleware);
  }
  app.use(router.allowedMethods());
};

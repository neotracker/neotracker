/* @flow */
import appRootDir from 'app-root-dir';
import { resolve as pathResolve } from 'path';

import serve from './serve';

export type Options = {|
  path: string,
  config?: {|
    maxAge?: number,
    immutable?: boolean,
    public?: boolean,
  |},
|};

export default ({
  name,
  route,
  options,
}: {|
  name: string,
  route: string,
  options: Options,
|}) => ({
  type: 'route',
  method: 'get',
  name,
  path: route === '/' || route.endsWith('/') ? `${route}*` : `${route}/*`,
  middleware: serve(pathResolve(appRootDir.get(), options.path), {
    ...options.config,
    prefix: route.endsWith('/') ? route.slice(0, -1) : route,
  }),
});

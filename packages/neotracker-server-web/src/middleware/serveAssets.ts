import { resolveRootPath } from '@neotracker/server-utils';
import { serve } from './serve';

export interface Options {
  readonly path: string;
  readonly config?: {
    readonly maxAge?: number;
    readonly immutable?: boolean;
    readonly public?: boolean;
  };
}

export const serveAssets = ({
  name,
  route,
  options,
}: {
  readonly name: string;
  readonly route: string;
  readonly options: Options;
}) => ({
  type: 'route',
  method: 'get',
  name,
  path: route === '/' || route.endsWith('/') ? `${route}*` : `${route}/*`,
  middleware: serve(resolveRootPath(options.path), {
    ...options.config,
    prefix: route.endsWith('/') ? route.slice(0, -1) : route,
  }),
});

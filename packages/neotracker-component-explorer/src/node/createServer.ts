// @ts-ignore
import history from 'connect-history-api-fallback';
// @ts-ignore
import convert from 'koa-connect';
// @ts-ignore
import serve from 'webpack-serve';
import { ExplorerConfig } from '../types';
import { createWebpackConfig } from './createWebpackConfig';

export const createServer = async (
  config: ExplorerConfig,
): Promise<{ readonly app: { readonly stop: (cb: () => void) => void } }> => {
  const webpackConfig = createWebpackConfig(config);

  return serve(
    {},
    {
      config: webpackConfig,
      open: true,
      hotClient: true,
      // tslint:disable-next-line no-any
      add: (app: any) => {
        app.use(
          convert(
            history({
              verbose: true,
              index: '/index.html',
              rewrites: [
                { from: /main\.js/, to: '/main.js' },
                // tslint:disable-next-line no-any
                { from: /sockjs/, to: (context: any) => context.parsedUrl.href },
              ],
            }),
          ),
        );
      },
    },
  );
};

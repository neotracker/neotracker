// @ts-ignore
import MiniHtmlWebpackPlugin from 'mini-html-webpack-plugin';
import * as path from 'path';
import webpack from 'webpack';
import { ExplorerConfig } from '../types';
import { ExplorerConfigPlugin } from './config';
import { StaticOptions } from './runner';

export const createWebpackConfig = (config: ExplorerConfig, staticOptions?: StaticOptions): webpack.Configuration => ({
  mode: 'development',
  entry:
    staticOptions === undefined
      ? ['react-dev-utils/webpackHotDevClient', path.resolve(__dirname, '../browser/entry.tsx')]
      : [path.resolve(__dirname, '../browser/entry.tsx')],
  resolve: {
    mainFields: ['browser', 'main'],
    aliasFields: ['browser'],
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  output: {
    path: path.resolve(
      process.cwd(),
      staticOptions === undefined || staticOptions.outDir === undefined ? '.out' : staticOptions.outDir,
    ),
    publicPath: staticOptions === undefined ? undefined : staticOptions.publicPath,
  },
  plugins: [
    new ExplorerConfigPlugin(config),
    new MiniHtmlWebpackPlugin({
      context: {
        title: config.meta.title,
      },
      // tslint:disable-next-line no-any
      template: ({ css, js, title, publicPath }: any) =>
        `<!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>${title}</title>
              ${MiniHtmlWebpackPlugin.generateCSSReferences(css, publicPath)}
            </head>
            <body style="margin: 0px;">
              <div id="explorer-root"></div>
              ${MiniHtmlWebpackPlugin.generateJSReferences(js, publicPath)}
            </body>
          </html>`,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.COMPONENT_EXPLORER_ROUTER': JSON.stringify(
        staticOptions === undefined ? 'browser' : staticOptions.router,
      ),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            useTranspileModule: true,
            transpileOnly: true,
            useBabel: true,
            babelOptions: {
              configFile: false,
              plugins: ['babel-plugin-styled-components'],
            },
            useCache: true,
            configFileName: 'tsconfig/tsconfig.es2018.esm.json',
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { minimize: false },
          },
        ],
      },
    ],
  },
});

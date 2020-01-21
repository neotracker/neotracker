import * as appRootDir from 'app-root-dir';
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
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: path.resolve(appRootDir.get(), 'node_modules', '.ce-cache'),
            },
          },
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              configFile: false,
              plugins: ['babel-plugin-styled-components'],
              cacheDirectory: path.resolve(appRootDir.get(), 'node_modules', '.ce-ts-babel-cache'),
            },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: true,
              context: appRootDir.get(),
              configFile: path.resolve(appRootDir.get(), 'tsconfig.static.json'),
              onlyCompileBundledFiles: true,
              experimentalFileCaching: true,
              experimentalWatchApi: true,
            },
          },
        ],
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
  node: {
    fs: 'empty',
    path: 'empty',
  },
});

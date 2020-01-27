import * as appRootDir from 'app-root-dir';
import * as path from 'path';
import webpack from 'webpack';
import webpackNodeExternals from 'webpack-node-externals';
import { createDefinePlugin } from './createDefinePlugin';
import { createRules } from './createRules';
import { createWebpackCompiler } from './createWebpackCompiler';

export const createNodeCompiler = ({
  title,
  entryPath,
  outputPath,
  dev,
  buildVersion,
  isCI,
  type = 'node',
  bin = false,
  nodeVersion,
}: {
  readonly title: string;
  readonly entryPath: string;
  readonly outputPath: string;
  readonly dev: boolean;
  readonly buildVersion: string;
  readonly isCI: boolean;
  readonly type?: 'server-web' | 'node';
  readonly bin?: boolean;
  readonly nodeVersion?: string;
}): webpack.Compiler => {
  const webpackConfig: webpack.Configuration = {
    mode: dev ? 'development' : 'production',
    entry: {
      index: path.resolve(appRootDir.get(), entryPath),
    },
    output: {
      path: path.resolve(appRootDir.get(), outputPath),
      filename: '[name].js',
      libraryTarget: 'commonjs2',
    },
    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },
    devtool: 'source-map',
    externals: [
      webpackNodeExternals({
        whitelist: [
          'source-map-support/register',
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|sss|less)$/,
          /.*neotracker.*/,
        ],
      }),
    ],
    plugins: [
      new webpack.BannerPlugin({
        banner: `${
          bin ? '#!/usr/bin/env node\n' : ''
        }require('source-map-support').install({ handleUncaughtExceptions: false, environment: 'node' });`,
        raw: true,
        entryOnly: true,
      }),
      createDefinePlugin({ dev, server: true, buildVersion }),
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          loaders: ['css-loader/locals'],
        },
      ].concat(createRules({ type, nodeVersion })),
    },
    resolve: {
      mainFields: ['module', 'main'],
      extensions: ['.js', '.json', '.jsx', '.css', '.ts', '.tsx'],
    },
    parallelism: 16,
    optimization: {
      minimize: false,
    },
  };

  return createWebpackCompiler({ target: title, config: webpackConfig, isCI });
};

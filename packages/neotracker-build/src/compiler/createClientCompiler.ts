import { utils } from '@neotracker/shared-utils';
import * as appRootDir from 'app-root-dir';
import AssetsWebpackPlugin from 'assets-webpack-plugin';
// @ts-ignore
import BrotliPlugin from 'brotli-webpack-plugin';
// @ts-ignore
import CompressionPlugin from 'compression-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
// @ts-ignore
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import * as path from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { configuration } from '../configuration';
import { createAlias } from './createAlias';
import { createDefinePlugin } from './createDefinePlugin';
import { createModuleMapperPlugins } from './createModuleMapperPlugins';
import { createRules } from './createRules';
import { createWebpackCompiler } from './createWebpackCompiler';

export const createClientCompiler = ({
  dev,
  buildVersion,
  isCI,
  analyze,
}: {
  readonly dev: boolean;
  readonly buildVersion: string;
  readonly isCI: boolean;
  readonly analyze?: boolean;
}): webpack.Compiler => {
  const filename = dev ? '[name]' : '[name]-[chunkhash]';
  const webpackConfig: webpack.Configuration = {
    mode: dev ? 'development' : 'production',
    entry: {
      index: path.resolve(appRootDir.get(), './packages/neotracker-client-web/src/entry.ts'),
    },
    output: {
      path: path.resolve(appRootDir.get(), configuration.clientBundlePath),
      filename: `${filename}.js`,
      chunkFilename: `${filename}.js`,
      libraryTarget: 'var',
      publicPath: configuration.clientPublicPath,
    },
    target: 'web',
    devtool: dev ? 'inline-source-map' : 'source-map',
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
      new ExtractTextPlugin({
        filename: `${filename}.css`,
        allChunks: true,
      }),
      new AssetsWebpackPlugin({
        filename: path.basename(configuration.clientAssetsPath),
        path: path.dirname(configuration.clientAssetsPath),
      }),
      createDefinePlugin({ dev, server: false, buildVersion }),
      dev ? undefined : new LodashModuleReplacementPlugin(),
      dev
        ? undefined
        : new CompressionPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 1024,
            minRatio: 0.8,
            cache: true,
          }),
      dev
        ? undefined
        : new BrotliPlugin({
            asset: '[path].br[query]',
            test: /\.(js|css|html|svg)$/,
            threshold: 1024,
            minRatio: 0.8,
          }),
      analyze
        ? new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        : undefined,
      analyze
        ? new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            defaultSizes: 'gzip',
            reportFilename: 'report-gzip.html',
          })
        : undefined,
    ]
      .concat(createModuleMapperPlugins())
      .filter(utils.notNull),
    module: {
      rules: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{ loader: 'css-loader', options: { importLoaders: 1 } }],
          }),
        },
      ].concat(createRules({ type: 'client-web', fast: dev })),
    },
    resolve: {
      mainFields: ['browser', 'module', 'main'],
      aliasFields: ['browser'],
      extensions: ['.js', '.json', '.jsx', '.css', '.ts', '.tsx'],
      alias: createAlias(),
    },
    parallelism: 16,
    optimization: {
      minimize: !dev,
    },
    node: {
      fs: 'empty',
      path: 'empty',
    },
  };

  return createWebpackCompiler({ target: 'client', config: webpackConfig, isCI });
};

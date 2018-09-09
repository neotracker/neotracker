import { utils } from '@neotracker/shared-utils';
import * as appRootDir from 'app-root-dir';
import AssetsWebpackPlugin from 'assets-webpack-plugin';
// @ts-ignore
import BrotliPlugin from 'brotli-webpack-plugin';
// @ts-ignore
import CompressionPlugin from 'compression-webpack-plugin';
import * as fs from 'fs-extra';
// @ts-ignore
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import * as path from 'path';
// tslint:disable-next-line no-submodule-imports
import { ReactLoadablePlugin } from 'react-loadable/webpack';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { configuration } from '../configuration';
import { createAlias } from './createAlias';
import { createDefinePlugin } from './createDefinePlugin';
import { createModuleMapperPlugins } from './createModuleMapperPlugins';
import { createRules } from './createRules';
import { createWebpackCompiler } from './createWebpackCompiler';

export const createClientCompilerNext = ({
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
      index: path.resolve(appRootDir.get(), './packages/neotracker-client-web-next/src/entry.ts'),
    },
    output: {
      path: path.resolve(appRootDir.get(), configuration.clientBundlePathNext),
      filename: `${filename}.js`,
      chunkFilename: `${filename}.js`,
      libraryTarget: 'var',
      publicPath: configuration.clientPublicPathNext,
    },
    target: 'web',
    devtool: dev ? 'inline-source-map' : 'source-map',
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
      new ReactLoadablePlugin({ filename: configuration.statsPath }),
      new AssetsWebpackPlugin({
        filename: path.basename(configuration.clientAssetsPathNext),
        path: path.dirname(configuration.clientAssetsPathNext),
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
      rules: createRules({ type: 'client-web', fast: dev }),
    },
    resolve: {
      mainFields: ['browser', 'module', 'main'],
      aliasFields: ['browser'],
      extensions: ['.wasm', '.mjs', '.js', '.json', '.mjsx', '.jsx', '.css', '.ts', '.tsx'],
      alias: createAlias(),
    },
    node: {
      fs: 'empty',
      path: 'empty',
    },
    parallelism: 16,
    optimization: {
      minimize: !dev,
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        name: true,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
  };

  const compiler = createWebpackCompiler({ target: 'client-next', config: webpackConfig, isCI });

  if (analyze) {
    compiler.hooks.emit.tapPromise('Stats', async (compilation) => {
      const stats = compilation.getStats().toJson({ chunkModules: true });
      const outputFile = path.resolve(compilation.outputOptions.path, 'full-stats.json');

      await fs.ensureDir(path.dirname(outputFile));
      await fs.writeFile(outputFile, JSON.stringify(stats));
    });
  }

  return compiler;
};

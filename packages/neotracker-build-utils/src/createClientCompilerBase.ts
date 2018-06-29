import * as appRootDir from 'app-root-dir';
import AssetsWebpackPlugin from 'assets-webpack-plugin';
import { TsConfigPathsPlugin } from 'awesome-typescript-loader';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { utils } from 'neotracker-shared-utils';
import * as path from 'path';
import * as webpack from 'webpack';
import { createDefinePlugin } from './createDefinePlugin';
import { createWebpackCompiler } from './createWebpackCompiler';

export const createClientCompilerBase = ({
  clientBundlePath,
  clientAssetsPath: clientAssetsPathIn,
  entry,
  filename,
  dev,
  buildVersion,
  plugins = [],
  rules,
  hiddenSourceMap,
}: {
  readonly clientBundlePath: string;
  readonly clientAssetsPath: string;
  readonly entry: { readonly [key: string]: string };
  readonly filename: '[name]' | '[name]-[chunkhash]';
  readonly dev: boolean;
  readonly buildVersion: string;
  readonly plugins?: ReadonlyArray<webpack.Plugin>;
  // tslint:disable-next-line no-any
  readonly rules: ReadonlyArray<any>;
  readonly hiddenSourceMap?: boolean;
}): webpack.Compiler => {
  const clientAssetsPath = path.resolve(appRootDir.get(), clientAssetsPathIn);
  const webpackConfig: webpack.Configuration = {
    mode: dev ? 'development' : 'production',
    entry,
    output: {
      path: path.resolve(appRootDir.get(), clientBundlePath),
      filename: `${filename}.js`,
      chunkFilename: `${filename}.js`,
      libraryTarget: 'var',
      publicPath: '/client/',
    },
    target: 'web',
    devtool: hiddenSourceMap ? 'hidden-source-map' : 'source-map',
    plugins: ([
      new webpack.ProgressPlugin(),
      new webpack.HashedModuleIdsPlugin(),
      new AssetsWebpackPlugin({
        filename: path.basename(clientAssetsPath),
        path: path.dirname(clientAssetsPath),
      }),
      new ExtractTextPlugin({
        filename: `${filename}.css`,
        allChunks: true,
      }),
      createDefinePlugin({ dev, server: false, buildVersion }),
    ] as ReadonlyArray<webpack.Plugin>)
      .concat(plugins)
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
      ].concat(rules),
    },
    resolve: {
      mainFields: ['browser', 'main'],
      extensions: ['.js', '.json', '.jsx', '.css', '.ts', '.tsx'],
      plugins: [new TsConfigPathsPlugin()],
    },
    parallelism: 16,
  };

  return createWebpackCompiler({ target: 'client', config: webpackConfig });
};

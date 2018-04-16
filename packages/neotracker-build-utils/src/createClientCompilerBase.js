/* @flow */
import AssetsPlugin from 'assets-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import appRootDir from 'app-root-dir';
import path from 'path';
import webpack from 'webpack';

import createDefinePlugin from './createDefinePlugin';
import createWebpackCompiler from './createWebpackCompiler';

export default ({
  clientBundlePath,
  clientAssetsPath: clientAssetsPathIn,
  entry,
  filename,
  dev,
  buildVersion,
  plugins = [],
  babelLoader,
  hiddenSourceMap,
}: {|
  clientBundlePath: string,
  clientAssetsPath: string,
  entry: { [key: string]: string },
  filename: '[name]' | '[name]-[chunkhash]',
  dev: boolean,
  buildVersion: string,
  plugins?: Array<mixed>,
  babelLoader: Object,
  hiddenSourceMap?: boolean,
|}): webpack => {
  const clientAssetsPath = path.resolve(appRootDir.get(), clientAssetsPathIn);
  const webpackConfig = {
    mode: dev ? 'development' : 'production',
    entry,
    output: {
      path: path.resolve(appRootDir.get(), clientBundlePath),
      filename: `${filename}.js`,
      chunkFilename: `${filename}.js`,
      libraryTarget: 'var',
      // TODO: Needs to match routes.CLIENT
      publicPath: '/client/',
    },
    target: 'web',
    devtool: hiddenSourceMap ? 'hidden-source-map' : 'source-map',
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.HashedModuleIdsPlugin(),
      new AssetsPlugin({
        filename: path.basename(clientAssetsPath),
        path: path.dirname(clientAssetsPath),
      }),
      new ExtractTextPlugin({
        filename: `${filename}.css`,
        allChunks: true,
      }),
      createDefinePlugin({ dev, server: false, buildVersion }),
    ]
      .concat(plugins)
      .filter(Boolean),
    module: {
      rules: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{ loader: 'css-loader', options: { importLoaders: 1 } }],
          }),
        },
        babelLoader,
      ],
    },
    resolve: {
      mainFields: ['browser', 'jsnext:main', 'module', 'main'],
      // TODO: Support .mjs once it works with ix/tslib
      extensions: ['.js', '.json', '.jsx', '.css'],
    },
    parallelism: 16,
  };

  return createWebpackCompiler({ target: 'client', config: webpackConfig });
};

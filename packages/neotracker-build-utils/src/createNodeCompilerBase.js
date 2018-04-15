/* @flow */
import nodeExternals from 'webpack-node-externals';
import webpack from 'webpack';

import createDefinePlugin from './createDefinePlugin';
import createWebpackCompiler from './createWebpackCompiler';

export default ({
  title,
  entry,
  outputPath,
  dev,
  babelLoader,
  buildVersion,
  plugins = [],
  externalsWhitelist,
  banner,
}: {|
  title: string,
  entry: { [key: string]: string },
  outputPath: string,
  dev: boolean,
  babelLoader: Object,
  buildVersion: string,
  plugins?: Array<mixed>,
  externalsWhitelist?: Array<string>,
  banner?: string,
|}): webpack => {
  const webpackConfig = {
    mode: dev ? 'development' : 'production',
    entry,
    output: {
      path: outputPath,
      filename: '[name].js',
      libraryTarget: 'commonjs2',
    },
    target: 'node',
    node: {
      __dirname: true,
      __filename: true,
    },
    devtool: 'source-map',
    externals: [
      nodeExternals({
        whitelist: [
          'source-map-support/register',
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|sss|less)$/,
          /.*neotracker.*/,
        ].concat(externalsWhitelist || []),
      }),
    ],
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.BannerPlugin({
        banner: `require('source-map-support').install({ handleUncaughtExceptions: false, environment: 'node' });${
          banner == null ? '' : banner
        }`,
        raw: true,
        entryOnly: true,
      }),
      createDefinePlugin({ dev, server: true, buildVersion }),
    ].concat(plugins),
    module: {
      rules: [
        {
          test: /\.css$/,
          loaders: ['css-loader/locals'],
        },
        babelLoader,
      ],
    },
    resolve: {
      mainFields: ['jsnext:main', 'module', 'main'],
    },
    parallelism: 16,
    optimization: {
      minimize: false,
    },
  };

  return createWebpackCompiler({ target: title, config: webpackConfig });
};

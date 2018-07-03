import { TsConfigPathsPlugin } from 'awesome-typescript-loader';
import webpack from 'webpack';
import webpackNodeExternals from 'webpack-node-externals';
import { createDefinePlugin } from './createDefinePlugin';
import { createWebpackCompiler } from './createWebpackCompiler';

export const createNodeCompilerBase = ({
  title,
  entry,
  outputPath,
  dev,
  rules,
  buildVersion,
  plugins = [],
  externalsWhitelist = [],
  banner,
}: {
  readonly title: string;
  readonly entry: { readonly [key: string]: string };
  readonly outputPath: string;
  readonly dev: boolean;
  // tslint:disable-next-line no-any
  readonly rules: ReadonlyArray<any>;
  readonly buildVersion: string;
  readonly plugins?: ReadonlyArray<webpack.Plugin>;
  readonly externalsWhitelist?: ReadonlyArray<string>;
  readonly banner?: string;
}): webpack.Compiler => {
  const webpackConfig: webpack.Configuration = {
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
      webpackNodeExternals({
        whitelist: [
          'source-map-support/register',
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|sss|less)$/,
          /.*neotracker.*/,
        ].concat(externalsWhitelist),
      }),
    ],
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.BannerPlugin({
        banner: `require('source-map-support').install({ handleUncaughtExceptions: false, environment: 'node' });${
          banner === undefined ? '' : banner
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
      ].concat(rules),
    },
    resolve: {
      mainFields: ['module', 'main'],
      extensions: ['.js', '.json', '.jsx', '.css', '.ts', '.tsx'],
      plugins: [new TsConfigPathsPlugin()],
    },
    parallelism: 16,
    optimization: {
      minimize: false,
    },
  };

  return createWebpackCompiler({ target: title, config: webpackConfig });
};

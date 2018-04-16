/* @flow */
import webpack from 'webpack';

export default ({
  dev,
  server,
  buildVersion,
}: {|
  dev: boolean,
  server: boolean,
  buildVersion: string,
|}) =>
  new webpack.DefinePlugin({
    __DEV__: JSON.stringify(dev),
    'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
    'process.env.BUILD_VERSION': JSON.stringify(buildVersion),
    'process.env.BUILD_FLAG_IS_SERVER': JSON.stringify(server),
  });

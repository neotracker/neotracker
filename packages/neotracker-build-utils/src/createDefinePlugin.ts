import webpack from 'webpack';

export const createDefinePlugin = ({
  dev,
  server,
  buildVersion,
}: {
  readonly dev: boolean;
  readonly server: boolean;
  readonly buildVersion: string;
}) =>
  new webpack.DefinePlugin({
    __DEV__: JSON.stringify(dev),
    'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
    'process.env.BUILD_VERSION': JSON.stringify(buildVersion),
    'process.env.BUILD_FLAG_IS_SERVER': JSON.stringify(server),
  });

/* @flow */
import appRootDir from 'app-root-dir';
import {
  createBabelLoader,
  createClientCompilerBase,
} from 'neotracker-build-utils';
import path from 'path';
import type webpack from 'webpack';

export default ({
  buildVersion,
  clientBundlePath,
  clientAssetsPath,
}: {|
  buildVersion: string,
  clientBundlePath: string,
  clientAssetsPath: string,
|}): webpack =>
  createClientCompilerBase({
    entry: {
      index: path.resolve(
        appRootDir.get(),
        './packages/neotracker-client-web/src/entry.js',
      ),
    },
    filename: '[name]',
    clientBundlePath,
    clientAssetsPath,
    babelLoader: createBabelLoader({
      type: 'client-web',
      include: [
        path.resolve(appRootDir.get(), './packages'),
        path.resolve(appRootDir.get(), './node_modules'),
      ],
    }),
    dev: true,
    buildVersion,
  });

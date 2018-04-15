/* @flow */
import appRootDir from 'app-root-dir';
import path from 'path';
import webpack from 'webpack';

import createBabelLoader, { type Type } from './createBabelLoader';
import createNodeCompilerBase from './createNodeCompilerBase';

export default ({
  title,
  entry,
  outputPath,
  type,
  buildVersion,
}: {|
  title: string,
  entry: { [key: string]: string },
  outputPath: string,
  type: Type,
  buildVersion: string,
|}): webpack =>
  createNodeCompilerBase({
    title,
    entry,
    outputPath,
    dev: true,
    babelLoader: createBabelLoader({
      type,
      include: [
        path.resolve(appRootDir.get(), './packages'),
        path.resolve(appRootDir.get(), './node_modules'),
      ],
    }),
    buildVersion,
  });

/* @flow */
import appRootDir from 'app-root-dir';
import { createNodeCompiler } from 'neotracker-build-utils';
import path from 'path';

export default ({ buildVersion }: {| buildVersion: string |}) =>
  createNodeCompiler({
    title: 'server',
    entry: {
      index: path.resolve(
        appRootDir.get(),
        './packages/neotracker-build-web/src/entry/server.js',
      ),
    },
    outputPath: path.resolve(appRootDir.get(), './build/server'),
    type: 'server-web',
    buildVersion,
  });

import * as appRootDir from 'app-root-dir';
import { createNodeCompiler } from 'neotracker-build-utils';
import * as path from 'path';

export const createServerCompiler = ({ buildVersion }: { readonly buildVersion: string }) =>
  createNodeCompiler({
    title: 'server',
    entry: {
      index: path.resolve(appRootDir.get(), './packages/neotracker-build-web/src/entry/server.ts'),
    },
    outputPath: path.resolve(appRootDir.get(), './build/server'),
    type: 'server-web',
    buildVersion,
  });

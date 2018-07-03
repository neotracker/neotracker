import * as appRootDir from 'app-root-dir';
import * as path from 'path';
import { createNodeCompiler } from '../createNodeCompiler';

export const createServerCompiler = ({ buildVersion }: { readonly buildVersion: string }) =>
  createNodeCompiler({
    title: 'server',
    entry: {
      index: path.resolve(appRootDir.get(), './packages/neotracker-build/src/entry/server.ts'),
    },
    outputPath: path.resolve(appRootDir.get(), './build/server'),
    type: 'server-web',
    buildVersion,
  });

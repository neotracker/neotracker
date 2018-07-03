import * as appRootDir from 'app-root-dir';
import * as path from 'path';
import webpack from 'webpack';
import { createClientCompilerBase } from '../createClientCompilerBase';
import { createRules } from '../createRules';

export const createClientCompiler = ({
  buildVersion,
  clientBundlePath,
  clientAssetsPath,
}: {
  readonly buildVersion: string;
  readonly clientBundlePath: string;
  readonly clientAssetsPath: string;
}): webpack.Compiler =>
  createClientCompilerBase({
    entry: {
      index: path.resolve(appRootDir.get(), './packages/neotracker-client-web/src/entry.ts'),
    },
    filename: '[name]',
    clientBundlePath,
    clientAssetsPath,
    rules: createRules({
      type: 'client-web',
      include: [path.resolve(appRootDir.get(), './packages'), path.resolve(appRootDir.get(), './node_modules')],
    }),
    dev: true,
    buildVersion,
  });

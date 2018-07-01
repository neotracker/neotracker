import * as appRootDir from 'app-root-dir';
import * as path from 'path';
import webpack from 'webpack';
import { createNodeCompilerBase } from './createNodeCompilerBase';
import { createRules, Type } from './createRules';

export const createNodeCompiler = ({
  title,
  entry,
  outputPath,
  type,
  buildVersion,
}: {
  readonly title: string;
  readonly entry: { readonly [key: string]: string };
  readonly outputPath: string;
  readonly type: Type;
  readonly buildVersion: string;
}): webpack.Compiler =>
  createNodeCompilerBase({
    title,
    entry,
    outputPath,
    dev: true,
    rules: createRules({
      type,
      include: [path.resolve(appRootDir.get(), './packages'), path.resolve(appRootDir.get(), './node_modules')],
    }),
    buildVersion,
  });

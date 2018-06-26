import appRootDir from 'app-root-dir';
import { createNodeCompiler } from 'neotracker-build-utils';
import path from 'path';
import * as webpack from 'webpack';
import { setupGraphQLCompiler } from './setupGraphQLCompiler';

export const createGraphQLCompiler = ({
  entryPath,
  outputPath,
  graphqlOutputPath,
  jsonOutputPath,
  buildVersion,
}: {
  readonly entryPath: string;
  readonly outputPath: string;
  readonly graphqlOutputPath: string;
  readonly jsonOutputPath: string;
  readonly buildVersion: string;
}): webpack.Compiler => {
  const compiler = createNodeCompiler({
    title: 'graphql',
    entry: {
      index: path.resolve(appRootDir.get(), entryPath),
    },
    outputPath: path.resolve(appRootDir.get(), outputPath),
    type: 'server-web',
    buildVersion,
  });

  return setupGraphQLCompiler({
    compiler,
    graphqlOutputPath,
    jsonOutputPath,
  });
};

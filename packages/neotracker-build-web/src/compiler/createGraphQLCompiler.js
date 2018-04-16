/* @flow */
import appRootDir from 'app-root-dir';
import { createNodeCompiler } from 'neotracker-build-utils';
import path from 'path';

import setupGraphQLCompiler from './setupGraphQLCompiler';

export default ({
  entryPath,
  outputPath,
  graphqlOutputPath,
  jsonOutputPath,
  buildVersion,
}: {|
  entryPath: string,
  outputPath: string,
  graphqlOutputPath: string,
  jsonOutputPath: string,
  buildVersion: string,
|}): any => {
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

import * as path from 'path';
import webpack from 'webpack';
import { createNodeCompiler } from './createNodeCompiler';
import { setupGraphQLCompiler } from './setupGraphQLCompiler';

export const createGraphQLCompiler = ({ isCI }: { readonly isCI: boolean }): webpack.Compiler => {
  const compiler = createNodeCompiler({
    title: 'graphql',
    entryPath: path.join('packages', 'neotracker-build', 'src', 'entry', 'graphql.ts'),
    outputPath: path.join('dist', 'neotracker-server-graphql'),
    type: 'server-web',
    buildVersion: 'dev',
    isCI,
    dev: true,
  });

  return setupGraphQLCompiler({ compiler });
};

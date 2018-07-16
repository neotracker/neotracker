import webpack from 'webpack';
import { executeGraphQLCompiler } from './executeGraphQLCompiler';

export const setupGraphQLCompiler = ({ compiler }: { readonly compiler: webpack.Compiler }): webpack.Compiler => {
  let executing = false;
  compiler.hooks.done.tapPromise('GraphQL', async (stats) => {
    if (!stats.hasErrors() && !executing) {
      executing = true;
      try {
        await executeGraphQLCompiler({ compiler });
      } finally {
        executing = false;
      }
    }
  });

  return compiler;
};

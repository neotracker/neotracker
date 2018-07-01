import webpack from 'webpack';
import { executeGraphQLCompiler } from './executeGraphQLCompiler';

export const setupGraphQLCompiler = ({
  compiler,
  graphqlOutputPath,
  jsonOutputPath,
}: {
  readonly compiler: webpack.Compiler;
  readonly graphqlOutputPath: string;
  readonly jsonOutputPath: string;
}): webpack.Compiler => {
  let executing = false;
  compiler.hooks.done.tapPromise('GraphQL', async (stats) => {
    if (!stats.hasErrors() && !executing) {
      executing = true;
      try {
        await executeGraphQLCompiler({
          compiler,
          graphqlOutputPath,
          jsonOutputPath,
        });
      } finally {
        executing = false;
      }
    }
  });

  return compiler;
};

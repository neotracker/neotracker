import webpack from 'webpack';
import { createGraphQLCompiler } from './createGraphQLCompiler';

export const watchGraphQL = async ({ isCI }: { readonly isCI: boolean }): Promise<webpack.Watching> => {
  const compiler = createGraphQLCompiler({ isCI });

  return new Promise<webpack.Watching>((resolve) => {
    compiler.hooks.done.tap('HotWebServer', () => {
      resolve();
    });

    return compiler.watch({}, () => undefined);
  });
};

import * as webpack from 'webpack';
import { createGraphQLCompiler } from './createGraphQLCompiler';

export const watchGraphQL = async ({
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
}): Promise<webpack.Watching> => {
  const compiler = createGraphQLCompiler({
    entryPath,
    outputPath,
    graphqlOutputPath,
    jsonOutputPath,
    buildVersion,
  });

  return compiler.watch({}, () => undefined);
};

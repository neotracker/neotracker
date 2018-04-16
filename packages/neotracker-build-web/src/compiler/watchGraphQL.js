/* @flow */
import createGraphQLCompiler from './createGraphQLCompiler';

export default async ({
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
|}): Promise<any> => {
  const compiler = createGraphQLCompiler({
    entryPath,
    outputPath,
    graphqlOutputPath,
    jsonOutputPath,
    buildVersion,
  });

  return compiler.watch(null, () => {});
};

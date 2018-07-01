import * as appRootDir from 'app-root-dir';
import execa from 'execa';
import { logError } from 'neotracker-build-utils';
import * as path from 'path';
import webpack from 'webpack';

const title = 'build-graphql';

export const executeGraphQLCompiler = async ({
  compiler,
  graphqlOutputPath,
  jsonOutputPath,
}: {
  readonly compiler: webpack.Compiler;
  readonly graphqlOutputPath: string;
  readonly jsonOutputPath: string;
}): Promise<void> => {
  const compiledEntryFile = path.resolve(
    appRootDir.get(),
    // tslint:disable-next-line:no-non-null-assertion
    compiler.options.output!.path!,
    // tslint:disable-next-line:no-non-null-assertion
    `${Object.keys(compiler.options.entry!)[0]}.js`,
  );

  try {
    await execa('node', [compiledEntryFile], {
      env: {
        ...process.env,
        OUTPUT_PATH: path.resolve(appRootDir.get(), graphqlOutputPath),
        JSON_OUTPUT_PATH: path.resolve(appRootDir.get(), jsonOutputPath),
      },
    });
  } catch (error) {
    logError({ title, error, message: 'GraphQL compile failed...' });
  }
};

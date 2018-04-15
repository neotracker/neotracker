/* @flow */
import appRootDir from 'app-root-dir';
import execa from 'execa';
import { logError } from 'neotracker-build-utils';
import path from 'path';
import type webpack from 'webpack';

const title = 'build-graphql';

export default async ({
  compiler,
  graphqlOutputPath,
  jsonOutputPath,
}: {|
  compiler: webpack,
  graphqlOutputPath: string,
  jsonOutputPath: string,
|}): Promise<void> => {
  const compiledEntryFile = path.resolve(
    appRootDir.get(),
    compiler.options.output.path,
    `${Object.keys(compiler.options.entry)[0]}.js`,
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

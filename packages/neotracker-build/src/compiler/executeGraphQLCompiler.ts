import * as appRootDir from 'app-root-dir';
import execa from 'execa';
import * as path from 'path';
import webpack from 'webpack';
import { logError } from '../logError';

const title = 'build-graphql';

const OUTPUT_DIR = path.resolve(appRootDir.get(), 'packages', 'neotracker-server-graphql', 'src', '__generated__');
const SCHEMA_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'schema.graphql');
const JSON_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'schema.graphql.json');

export const executeGraphQLCompiler = async ({ compiler }: { readonly compiler: webpack.Compiler }): Promise<void> => {
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
        OUTPUT_PATH: SCHEMA_OUTPUT_PATH,
        JSON_OUTPUT_PATH,
      },
    });
  } catch (error) {
    logError({ title, error, message: 'GraphQL compile failed...' });
  }
};

// tslint:disable-next-line no-import-side-effect
import '@babel/polyfill';
import fs from 'fs-extra';
import { ExecutionResult, graphql, introspectionQuery } from 'graphql';
// tslint:disable-next-line no-submodule-imports
import { buildClientSchema, IntrospectionQuery, printSchema } from 'graphql/utilities';
import { log, logError } from 'neotracker-build-utils';
import { schema } from 'neotracker-server-graphql';
import path from 'path';

const title = 'build-graphql';

const outputPath = process.env.OUTPUT_PATH;
const jsonOutputPath = process.env.JSON_OUTPUT_PATH;
if (outputPath === undefined || jsonOutputPath === undefined) {
  log({
    title,
    message: 'Building GraphQL schema requires OUTPUT_PATH and JSON_OUTPUT_PATH',
  });

  process.exit(1);
  // For Flow
  throw new Error('Exited');
}

const run = async () => {
  log({
    title,
    message: 'Building GraphQL schema...',
  });

  const logGraphQLError = ({ error, errorMessage }: { error?: Error; errorMessage?: string }) =>
    logError({
      title,
      message: 'GraphQL introspection query failed.',
      error,
      errorMessage,
    });

  let result: ExecutionResult;
  try {
    result = await graphql(schema, introspectionQuery);
  } catch (error) {
    logGraphQLError({ error });
    throw error;
  }

  if (result.errors !== undefined && result.errors.length > 0) {
    logGraphQLError({ errorMessage: JSON.stringify(result.errors, undefined, 2) });
    throw new Error('GraphQL introspection query failed.');
  }

  fs.mkdirpSync(path.dirname(jsonOutputPath));
  fs.writeFileSync(jsonOutputPath, JSON.stringify(result, undefined, 2));

  fs.mkdirpSync(path.dirname(outputPath));
  fs.writeFileSync(outputPath, printSchema(buildClientSchema(result.data as IntrospectionQuery)));

  log({
    title,
    level: 'info',
    message: 'GraphQL build complete.',
  });
};

run().catch(() => {
  process.exit(1);
});

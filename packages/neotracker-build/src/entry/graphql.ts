import { schema } from '@neotracker/server-graphql';
import * as fs from 'fs-extra';
import { ExecutionResult, graphql, introspectionQuery } from 'graphql';
// tslint:disable-next-line no-submodule-imports
import { buildClientSchema, IntrospectionQuery, printSchema } from 'graphql/utilities';
import * as path from 'path';

import { log } from '../log';
import { logError } from '../logError';

const title = 'build-graphql';

const outputPath = process.env.OUTPUT_PATH;
const jsonOutputPath = process.env.JSON_OUTPUT_PATH;
if (outputPath === undefined || jsonOutputPath === undefined) {
  log({
    title,
    message: 'Building GraphQL schema requires OUTPUT_PATH and JSON_OUTPUT_PATH',
  });

  process.exit(1);
  // @ts-ignore For Flow
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
    result = await graphql(schema(), introspectionQuery);
  } catch (error) {
    logGraphQLError({ error });
    throw error;
  }

  if (result.errors !== undefined && result.errors.length > 0) {
    logGraphQLError({ errorMessage: JSON.stringify(result.errors, undefined, 2) });
    throw new Error('GraphQL introspection query failed.');
  }

  await fs.mkdirp(path.dirname(jsonOutputPath));
  await fs.writeFile(jsonOutputPath, JSON.stringify(result, undefined, 2));

  await fs.mkdirp(path.dirname(outputPath));
  await fs.writeFile(outputPath, printSchema(buildClientSchema(result.data as IntrospectionQuery)));

  log({
    title,
    level: 'info',
    message: 'GraphQL build complete.',
  });
};

run().catch(() => {
  process.exit(1);
});

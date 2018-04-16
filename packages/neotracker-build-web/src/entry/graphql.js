/* @flow */
import '@babel/polyfill';

import { buildClientSchema, printSchema } from 'graphql/utilities';
import fs from 'fs-extra';
import { graphql, introspectionQuery } from 'graphql';
import log from 'neotracker-build-utils/src/log';
import logError from 'neotracker-build-utils/src/logError';
import path from 'path';

import { schema } from 'neotracker-server-graphql';

const title = 'build-graphql';

const outputPath = process.env.OUTPUT_PATH;
const jsonOutputPath = process.env.JSON_OUTPUT_PATH;
if (outputPath == null || jsonOutputPath == null) {
  log({
    title,
    message:
      'Building GraphQL schema requires OUTPUT_PATH and JSON_OUTPUT_PATH',
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

  const logGraphQLError = ({
    error,
    errorMessage,
  }: {
    error?: Error,
    errorMessage?: string,
  }) =>
    logError({
      title,
      message: 'GraphQL introspection query failed.',
      error,
      errorMessage,
      notify: true,
    });
  let result;
  try {
    result = await graphql(schema, introspectionQuery);
  } catch (error) {
    logGraphQLError({ error });
    throw error;
  }

  if (result) {
    if (result.errors != null && result.errors.length > 0) {
      logGraphQLError({ errorMessage: JSON.stringify(result.errors, null, 2) });
      throw new Error('GraphQL introspection query failed.');
    } else {
      fs.mkdirpSync(path.dirname(jsonOutputPath));
      fs.writeFileSync(jsonOutputPath, JSON.stringify(result, null, 2));

      fs.mkdirpSync(path.dirname(outputPath));
      fs.writeFileSync(
        outputPath,
        // $FlowFixMe
        printSchema(buildClientSchema(result.data)),
      );

      log({
        title,
        level: 'info',
        message: 'GraphQL build complete.',
      });
    }
  }
};

run().catch(() => {
  process.exit(1);
});

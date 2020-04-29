import { createChild, serverLogger } from '@neotracker/logger';
import { RootLoader } from '@neotracker/server-db';
import { ExecutionResult, QueryDeduplicator } from '@neotracker/shared-graphql';
import { labels, sanitizeError, sanitizeErrorNullable } from '@neotracker/shared-utils';
import { DocumentNode, execute, ExecutionResult as GraphQLExecutionResult, GraphQLError, GraphQLSchema } from 'graphql';
import { GraphQLContext } from './GraphQLContext';
import { makeContext } from './makeContext';
import { QueryMap } from './QueryMap';

const serverGQLLogger = createChild(serverLogger, { component: 'graphql' });

function logError(title: string, error: Error) {
  serverGQLLogger.error({ title, error: error.message });
}

export function formatError(title: string, graphQLError: GraphQLError | Error) {
  // tslint:disable-next-line no-any
  const error = (graphQLError as any).originalError;
  if (error != undefined) {
    logError(title, error);
    const sanitized = sanitizeErrorNullable(error);
    if (sanitized !== undefined) {
      return { message: sanitized.message };
    }
  } else {
    logError(title, graphQLError);
  }

  return { message: sanitizeError(graphQLError).message };
}

export function convertExecutionResult(result: GraphQLExecutionResult): ExecutionResult {
  if (result.errors !== undefined && result.errors.length > 0) {
    return {
      errors: result.errors.map((error) => formatError('graphql_execute_error', error)),
    };
  }

  if (result.data === null) {
    return { data: undefined };
  }

  return { data: result.data };
}

export async function doExecuteForDocument({
  schema,
  context,
  doc,
  variables,
  rootValue,
}: {
  readonly schema: GraphQLSchema;
  readonly context: GraphQLContext;
  readonly doc: DocumentNode;
  // tslint:disable-next-line no-any
  readonly variables: any;
  // tslint:disable-next-line no-any
  readonly rootValue?: any | undefined;
}): Promise<ExecutionResult> {
  try {
    const response = await execute(schema, doc, rootValue, context, variables);
    if (response.errors !== undefined && response.errors.length > 0) {
      serverLogger.error({
        title: 'graphql_top_level_execute_variables',
        variables,
      });
    }

    return convertExecutionResult(response);
  } catch (error) {
    serverGQLLogger.error({
      title: 'graphql_top_level_execute_error',
      error: error.message,
    });

    return {
      errors: [{ message: sanitizeError(error).message }],
    };
  }
}

export async function getDocument({ queryMap, id }: { readonly queryMap: QueryMap; readonly id: string }) {
  try {
    const doc = await queryMap.get(id);

    return { type: 'doc', doc };
  } catch (error) {
    serverGQLLogger.error({ name: 'graphql_get_query', error: error.message });

    return {
      type: 'error',
      errors: [{ message: sanitizeError(error).message }],
    };
  }
}

async function doExecute(
  schema: GraphQLSchema,
  queryMap: QueryMap,
  id: string,
  // tslint:disable-next-line no-any
  variables: any,
  rootLoader: RootLoader,
): Promise<ExecutionResult> {
  const logInfo = {
    title: 'graphql_execute',
    [labels.GRAPHQL_QUERY]: id,
    [labels.GRAPHQL_VARIABLES]: JSON.stringify(variables),
  };
  serverGQLLogger.info({ ...logInfo });
  const docResult = await getDocument({ queryMap, id });
  if (docResult.type === 'error' || docResult.doc === undefined) {
    if (docResult.errors) {
      serverGQLLogger.error({ ...logInfo });
    }
    if (docResult.errors !== undefined) {
      docResult.errors.forEach((error) => serverGQLLogger.error({ ...logInfo, error: error.message }));
    }

    return { errors: docResult.errors };
  }
  const context = makeContext(rootLoader, docResult.doc, id);

  return doExecuteForDocument({
    schema,
    context,
    doc: docResult.doc,
    variables,
  });
}

export function createQueryDeduplicator(
  schema: GraphQLSchema,
  queryMap: QueryMap,
  rootLoader: RootLoader,
): QueryDeduplicator {
  return new QueryDeduplicator(
    async (queries) =>
      Promise.all(queries.map(async (query) => doExecute(schema, queryMap, query.id, query.variables, rootLoader))),
    {},
  );
}

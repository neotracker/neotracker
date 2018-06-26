import { Monitor } from '@neo-one/monitor';
import { DocumentNode, execute, ExecutionResult as GraphQLExecutionResult, GraphQLError, GraphQLSchema } from 'graphql';
import { RootLoader } from 'neotracker-server-db';
import { ExecutionResult, QueryDeduplicator } from 'neotracker-shared-graphql';
import { labels, sanitizeError, sanitizeErrorNullable } from 'neotracker-shared-utils';
import { GraphQLContext } from './GraphQLContext';
import { makeContext } from './makeContext';
import { QueryMap } from './QueryMap';

function logError(monitor: Monitor, name: string, error: Error) {
  monitor.logError({ name, error });
}

export function formatError(monitor: Monitor, name: string, graphQLError: GraphQLError | Error) {
  // tslint:disable-next-line no-any
  const error = (graphQLError as any).originalError;
  if (error != undefined) {
    logError(monitor, name, error);
    const sanitized = sanitizeErrorNullable(error);
    if (sanitized !== undefined) {
      return { message: sanitized.message };
    }
  } else {
    logError(monitor, name, graphQLError);
  }

  return { message: sanitizeError(graphQLError).message };
}

export function convertExecutionResult(result: GraphQLExecutionResult, monitor: Monitor): ExecutionResult {
  if (result.errors !== undefined && result.errors.length > 0) {
    return {
      errors: result.errors.map((error) => formatError(monitor, 'graphql_execute_error', error)),
    };
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

    return convertExecutionResult(response, context.getMonitor());
  } catch (error) {
    context.getMonitor().logError({
      name: 'graphql_top_level_execute_error',
      error,
    });

    return {
      errors: [{ message: sanitizeError(error).message }],
    };
  }
}

export async function getDocument({
  queryMap,
  monitor,
  id,
}: {
  readonly queryMap: QueryMap;
  readonly monitor: Monitor;
  readonly id: string;
}) {
  try {
    const doc = await queryMap.get(id);

    return { type: 'doc', doc };
  } catch (error) {
    monitor.logError({ name: 'graphql_get_query', error });

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
  monitor: Monitor,
): Promise<ExecutionResult> {
  return monitor
    .withLabels({
      [labels.GRAPHQL_QUERY]: id,
    })
    .withData({
      [labels.GRAPHQL_VARIABLES]: JSON.stringify(variables),
    })
    .at('graphql_server')
    .captureSpanLog(
      async (span) => {
        const docResult = await getDocument({ queryMap, monitor: span, id });
        if (docResult.type === 'error' || docResult.doc === undefined) {
          return { errors: docResult.errors };
        }
        const context = makeContext(rootLoader, span, docResult.doc, id);

        return doExecuteForDocument({
          schema,
          context,
          doc: docResult.doc,
          variables,
        });
      },
      {
        name: 'graphql_execute',
        level: { log: 'verbose', span: 'info' },
      },
    );
}

export function createQueryDeduplicator(
  monitorIn: Monitor,
  schema: GraphQLSchema,
  queryMap: QueryMap,
  rootLoader: RootLoader,
): QueryDeduplicator {
  return new QueryDeduplicator(
    async (queries, monitor) =>
      Promise.all(
        queries.map(async (query) => doExecute(schema, queryMap, query.id, query.variables, rootLoader, monitor)),
      ),
    monitorIn,
  );
}

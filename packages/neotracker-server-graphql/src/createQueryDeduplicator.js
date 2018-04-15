/* @flow */
import {
  type DocumentNode,
  type ExecutionResult as GraphQLExecutionResult,
  type GraphQLError,
  type GraphQLSchema,
  execute,
} from 'graphql';
import type { RootLoader } from 'neotracker-server-db';
import {
  type ExecutionResult,
  QueryDeduplicator,
} from 'neotracker-shared-graphql';
import type { Monitor } from '@neo-one/monitor';

import {
  labels,
  sanitizeError,
  sanitizeErrorNullable,
} from 'neotracker-shared-utils';

import type { GraphQLContext } from './GraphQLContext';
import type QueryMap from './QueryMap';

import makeContext from './makeContext';

function logError(monitor: Monitor, name: string, error: Error) {
  monitor.logError({ name, error });
}

export function formatError(
  monitor: Monitor,
  name: string,
  graphQLError: GraphQLError | Error,
) {
  const error = (graphQLError: $FlowFixMe).originalError;
  if (error != null) {
    logError(monitor, name, error);
    const sanitized = sanitizeErrorNullable(error);
    if (sanitized != null) {
      return { message: sanitized.message };
    }
  } else {
    logError(monitor, name, graphQLError);
  }

  return { message: sanitizeError(graphQLError).message };
}

export function convertExecutionResult(
  result: GraphQLExecutionResult,
  monitor: Monitor,
): ExecutionResult {
  if (result.errors != null && result.errors.length > 0) {
    return {
      errors: result.errors.map(error =>
        formatError(monitor, 'graphql_execute_error', error),
      ),
    };
  }

  return { data: result.data };
}

export async function doExecuteForDocument({
  schema,
  context,
  doc,
  variables,
  rootValue = null,
}: {|
  schema: GraphQLSchema,
  context: GraphQLContext,
  doc: DocumentNode,
  variables: Object,
  rootValue?: ?any,
|}): Promise<ExecutionResult> {
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
}: {|
  queryMap: QueryMap,
  monitor: Monitor,
  id: string,
|}) {
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
  variables: Object,
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
      async span => {
        const docResult = await getDocument({ queryMap, monitor: span, id });
        if (docResult.type === 'error') {
          return { errors: docResult.errors };
        }
        const context = makeContext(rootLoader, span, docResult.doc, id);
        const result = await doExecuteForDocument({
          schema,
          context,
          doc: docResult.doc,
          variables,
        });

        return result;
      },
      {
        name: 'graphql_execute',
        level: { log: 'verbose', span: 'info' },
      },
    );
}

export default function(
  monitorIn: Monitor,
  schema: GraphQLSchema,
  queryMap: QueryMap,
  rootLoader: RootLoader,
): QueryDeduplicator {
  return new QueryDeduplicator(
    (queries, monitor) =>
      Promise.all(
        queries.map(query =>
          doExecute(
            schema,
            queryMap,
            query.id,
            query.variables,
            rootLoader,
            monitor,
          ),
        ),
      ),
    monitorIn,
  );
}

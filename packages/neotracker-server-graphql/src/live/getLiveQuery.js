/* @flow */
import type { ExecutionResult } from 'neotracker-shared-graphql';
import type { FieldNode, GraphQLObjectType } from 'graphql';
import { Observable } from 'rxjs';

import { locatedError } from 'graphql/error/locatedError';
import {
  type ExecutionContext,
  addPath,
  assertValidExecutionArguments,
  buildExecutionContext,
  buildResolveInfo,
  collectFields,
  getFieldDef,
  getOperationRootType,
  resolveFieldValueOrError,
  responsePathAsArray,
} from 'graphql/execution/execute';
import type { GraphQLSchema } from 'graphql/type/schema';
import invariant from 'graphql/jsutils/invariant';

import type { ObjMap } from 'graphql/jsutils/ObjMap';
import type { DocumentNode } from 'graphql/language/ast';
import type { GraphQLFieldResolver } from 'graphql/type/definition';

const isObservable = (value: mixed): boolean => (value: any).subscribe != null;

const getFieldLiveQuery = (
  exeContext: ExecutionContext,
  schema: GraphQLSchema,
  type: GraphQLObjectType,
  responseName: string,
  fieldNodes: $ReadOnlyArray<FieldNode>,
  rootValue?: mixed,
): Promise<Observable<ExecutionResult>> =>
  new Promise((resolve, reject) => {
    invariant(fieldNodes.length === 1, 'Expected a single field node.');
    const fieldNode = fieldNodes[0];
    const fieldDef = getFieldDef(schema, type, fieldNode.name.value);
    invariant(fieldDef, 'This live query is not defined by the schema.');

    // Call the `subscribe()` resolver or the default resolver to produce an
    // AsyncIterable yielding raw payloads.
    const resolveFn = ((fieldDef: any).live: any) || exeContext.fieldResolver;

    const path = addPath(undefined, responseName);

    const info = buildResolveInfo(exeContext, fieldDef, fieldNodes, type, path);

    // resolveFieldValueOrError implements the "ResolveFieldEventStream"
    // algorithm from GraphQL specification. It differs from
    // "ResolveFieldValue" due to providing a different `resolveFn`.
    Promise.resolve(
      resolveFieldValueOrError(
        exeContext,
        fieldDef,
        fieldNodes,
        resolveFn,
        rootValue,
        info,
      ),
    )
      .then((subscription: any) => {
        // Reject with a located GraphQLError if subscription source fails
        // to resolve.
        if (subscription instanceof Error) {
          const error = locatedError(
            subscription,
            fieldNodes,
            responsePathAsArray(path),
          );
          reject(error);
        }

        if (!isObservable(subscription)) {
          reject(
            new Error(
              `Subscription must return Async Iterable. Received: ` +
                `${String(subscription)}`,
            ),
          );
        }

        resolve(subscription);
      })
      .catch(reject);
  });

// Adapted from graphql-js createSourceEventStream
export default async (
  schema: GraphQLSchema,
  document: DocumentNode,
  rootValue?: mixed,
  contextValue?: mixed,
  variableValues?: ObjMap<mixed>,
  operationName?: ?string,
  fieldResolver?: ?GraphQLFieldResolver<any, any>,
): Promise<Array<[string, Observable<ExecutionResult>]>> => {
  // If arguments are missing or incorrectly typed, this is an internal
  // developer mistake which should throw an early error.
  assertValidExecutionArguments(schema, document, variableValues);

  const exeContext = buildExecutionContext(
    schema,
    document,
    rootValue,
    contextValue,
    variableValues,
    operationName,
    fieldResolver,
  );

  if (Array.isArray(exeContext)) {
    throw exeContext[0];
  }

  const type = getOperationRootType(schema, exeContext.operation);
  const fields = collectFields(
    exeContext,
    type,
    exeContext.operation.selectionSet,
    Object.create(null),
    Object.create(null),
  );
  const responseNames = Object.keys(fields);
  const fieldLiveQueries = await Promise.all(
    responseNames.map(async responseName => {
      const fieldLiveQuery = await getFieldLiveQuery(
        exeContext,
        schema,
        type,
        responseName,
        fields[responseName],
        rootValue,
      );
      return ([responseName, fieldLiveQuery]: [
        string,
        Observable<ExecutionResult>,
      ]);
    }),
  );

  return fieldLiveQueries;
};

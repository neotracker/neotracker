import { FieldNode, GraphQLObjectType } from 'graphql';
import { locatedError } from 'graphql/error/locatedError';
import {
  addPath,
  assertValidExecutionArguments,
  buildExecutionContext,
  buildResolveInfo,
  collectFields,
  ExecutionContext,
  getFieldDef,
  getOperationRootType,
  resolveFieldValueOrError,
  responsePathAsArray,
} from 'graphql/execution/execute';
// @ts-ignore
import invariant from 'graphql/jsutils/invariant';
// @ts-ignore
import { ObjMap } from 'graphql/jsutils/ObjMap';
import { DocumentNode } from 'graphql/language/ast';
import { GraphQLFieldResolver } from 'graphql/type/definition';
import { GraphQLSchema } from 'graphql/type/schema';
import { ExecutionResult } from 'neotracker-shared-graphql';
import { Observable } from 'rxjs';

// tslint:disable-next-line no-any
const isObservable = (value: any): value is Observable<any> => value.subscribe != undefined;

const getFieldLiveQuery = async (
  exeContext: ExecutionContext,
  schema: GraphQLSchema,
  type: GraphQLObjectType,
  responseName: string,
  fieldNodes: ReadonlyArray<FieldNode>,
  // tslint:disable-next-line no-any
  rootValue?: any,
): Promise<Observable<ExecutionResult>> =>
  new Promise<Observable<ExecutionResult>>((resolve, reject) => {
    invariant(fieldNodes.length === 1, 'Expected a single field node.');
    const fieldNode = fieldNodes[0];
    const fieldDef = getFieldDef(schema, type, fieldNode.name.value);
    if (fieldDef == undefined) {
      throw new Error('This live query is not defined by the schema.');
    }

    // Call the `subscribe()` resolver or the default resolver to produce an
    // AsyncIterable yielding raw payloads.
    // tslint:disable-next-line no-any
    const resolveFn = (fieldDef as any).live === undefined ? exeContext.fieldResolver : (fieldDef as any).live;

    const path = addPath(undefined, responseName);

    const info = buildResolveInfo(exeContext, fieldDef, fieldNodes, type, path);

    // resolveFieldValueOrError implements the "ResolveFieldEventStream"
    // algorithm from GraphQL specification. It differs from
    // "ResolveFieldValue" due to providing a different `resolveFn`.
    Promise.resolve(resolveFieldValueOrError(exeContext, fieldDef, fieldNodes, resolveFn, rootValue, info))
      // tslint:disable-next-line no-any
      .then((subscription: any) => {
        // Reject with a located GraphQLError if subscription source fails
        // to resolve.
        if (subscription instanceof Error) {
          const error = locatedError(subscription, fieldNodes, responsePathAsArray(path));

          reject(error);
        }

        if (!isObservable(subscription)) {
          reject(new Error(`Subscription must return Async Iterable. Received: ` + `${String(subscription)}`));
        }

        resolve(subscription);
      })
      .catch(reject);
  });

// Adapted from graphql-js createSourceEventStream
export const getLiveQuery = async (
  schema: GraphQLSchema,
  document: DocumentNode,
  // tslint:disable-next-line no-any
  rootValue?: any,
  // tslint:disable-next-line no-any
  contextValue?: any,
  // tslint:disable-next-line no-any
  variableValues?: ObjMap<any>,
  operationName?: string | undefined,
  // tslint:disable-next-line no-any
  fieldResolver?: GraphQLFieldResolver<any, any> | undefined,
): Promise<ReadonlyArray<[string, Observable<ExecutionResult>]>> => {
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
  const executionContext = exeContext as ExecutionContext;

  const type = getOperationRootType(schema, executionContext.operation);
  const fields = collectFields(
    executionContext,
    type,
    executionContext.operation.selectionSet,
    // tslint:disable-next-line:no-null-keyword
    Object.create(null),
    // tslint:disable-next-line:no-null-keyword
    Object.create(null),
  );

  const responseNames = Object.keys(fields);

  return Promise.all(
    responseNames.map<Promise<[string, Observable<ExecutionResult>]>>(async (responseName) => {
      const fieldLiveQuery$ = await getFieldLiveQuery(
        executionContext,
        schema,
        type,
        responseName,
        fields[responseName],
        rootValue,
      );

      return [responseName, fieldLiveQuery$];
    }),
  );
};

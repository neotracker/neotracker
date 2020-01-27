import { ExecutionResult } from '@neotracker/shared-graphql';
import { FieldNode, getOperationRootType, GraphQLObjectType } from 'graphql';
import { locatedError } from 'graphql/error/locatedError';
import {
  assertValidExecutionArguments,
  buildExecutionContext,
  buildResolveInfo,
  collectFields,
  execute,
  ExecutionContext,
  getFieldDef,
  resolveFieldValueOrError,
} from 'graphql/execution/execute';
// @ts-ignore
import invariant from 'graphql/jsutils/invariant';
// @ts-ignore
import { ObjMap } from 'graphql/jsutils/ObjMap';
import { addPath, pathToArray } from 'graphql/jsutils/Path';
import { DocumentNode } from 'graphql/language/ast';
import { GraphQLFieldResolver } from 'graphql/type/definition';
import { GraphQLSchema } from 'graphql/type/schema';
import { Observable, of as _of } from 'rxjs';

interface ExecuteArgs {
  readonly document: DocumentNode;
  // tslint:disable-next-line no-any
  readonly contextValue?: any;
  // tslint:disable-next-line no-any
  readonly variableValues?: ObjMap<any>;
  readonly operationName?: string | undefined;
}

// tslint:disable-next-line no-any
const isObservable = (value: any): value is Observable<any> => value != undefined && value.subscribe != undefined;

const getFieldLiveQuery = async ({
  exeContext,
  schema,
  type,
  responseName,
  fieldNodes,
  createObservable,
  rootValue,
}: {
  readonly exeContext: ExecutionContext;
  readonly schema: GraphQLSchema;
  // tslint:disable-next-line no-any
  readonly type: GraphQLObjectType;
  readonly responseName: string;
  readonly fieldNodes: ReadonlyArray<FieldNode>;
  readonly createObservable?: ExecuteArgs;
  // tslint:disable-next-line no-any
  readonly rootValue?: any;
  // tslint:disable-next-line no-any
}): Promise<Observable<ExecutionResult>> =>
  new Promise<Observable<ExecutionResult>>((resolve, reject) => {
    invariant(fieldNodes.length === 1, 'Expected a single field node.');
    const fieldNode = fieldNodes[0];
    const name = fieldNode.name.value;

    const fieldDef = getFieldDef(schema, type, name);
    if (fieldDef == undefined) {
      throw new Error('This live query is not defined by the schema.');
    }

    // Call the `subscribe()` resolver or the default resolver to produce an
    // AsyncIterable yielding raw payloads.
    const resolveFn =
      // tslint:disable-next-line no-any
      (fieldDef as any).live === undefined
        ? fieldDef.resolve === undefined
          ? exeContext.fieldResolver
          : fieldDef.resolve
        : // tslint:disable-next-line no-any
          (fieldDef as any).live;

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
          const error = locatedError(subscription, fieldNodes, pathToArray(path));

          reject(error);
        }

        if (!isObservable(subscription)) {
          if (createObservable !== undefined) {
            const result = execute(
              schema,
              createObservable.document,
              rootValue,
              createObservable.contextValue,
              createObservable.variableValues,
              createObservable.operationName,
              resolveFn,
            ) as ExecutionResult;

            resolve(_of(result));
          } else {
            reject(new Error(`Subscription must return Async Iterable. Received: ` + `${String(subscription)}`));
          }
        }

        resolve(subscription);
      })
      .catch(reject);
  });

// Adapted from graphql-js createSourceEventStream
export const getLiveQuery = async ({
  schema,
  document,
  rootValue,
  contextValue,
  variableValues,
  operationName,
  fieldResolver,
  createObservable = false,
}: {
  readonly schema: GraphQLSchema;
  readonly document: DocumentNode;
  // tslint:disable-next-line no-any
  readonly rootValue?: any;
  // tslint:disable-next-line no-any
  readonly contextValue?: any;
  // tslint:disable-next-line no-any
  readonly variableValues?: ObjMap<any>;
  readonly operationName?: string | undefined;
  // tslint:disable-next-line no-any
  readonly fieldResolver?: GraphQLFieldResolver<any, any> | undefined;
  readonly createObservable?: boolean;
}): Promise<ReadonlyArray<readonly [string, Observable<ExecutionResult>]>> => {
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

  const executeArgs = {
    document,
    contextValue,
    variableValues,
    operationName,
  };

  return Promise.all(
    responseNames.map<Promise<readonly [string, Observable<ExecutionResult>]>>(async (responseName) => {
      const fieldLiveQuery$ = await getFieldLiveQuery({
        exeContext: executionContext,
        schema,
        type,
        responseName,
        fieldNodes: fields[responseName],
        createObservable: createObservable ? executeArgs : undefined,
        rootValue,
      });

      return [responseName, fieldLiveQuery$] as const;
    }),
  );
};

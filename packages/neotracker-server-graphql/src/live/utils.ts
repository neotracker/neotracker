// tslint:disable
import { GraphQLError, locatedError } from 'graphql/error';
import {
  buildResolveInfo,
  collectFields,
  ExecutionContext,
  getFieldDef,
  resolveFieldValueOrError,
} from 'graphql/execution/execute';
// @ts-ignore
import invariant from 'graphql/jsutils/invariant';
// @ts-ignore
import isInvalid from 'graphql/jsutils/isInvalid';
// @ts-ignore
import isNullish from 'graphql/jsutils/isNullish';
// @ts-ignore
import isPromise from 'graphql/jsutils/isPromise';
// @ts-ignore
import { MaybePromise } from 'graphql/jsutils/MaybePromise';
// @ts-ignore
import memoize3 from 'graphql/jsutils/memoize3';
import { addPath, Path, pathToArray } from 'graphql/jsutils/Path';
// @ts-ignore
import { ObjMap } from 'graphql/jsutils/ObjMap';
import { DocumentNode, FieldNode } from 'graphql/language/ast';
import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLOutputType,
  isAbstractType,
  isLeafType,
  isListType,
  isNonNullType,
  isObjectType,
} from 'graphql/type/definition';
import {
  GraphQLAbstractType,
  GraphQLFieldResolver,
  GraphQLLeafType,
  GraphQLResolveInfo,
} from 'graphql/type/definition';
import { GraphQLSchema } from 'graphql/type/schema';
import { forEach, isCollection } from 'iterall';

/**
 * Terminology
 *
 * "Definitions" are the generic name for top-level statements in the document.
 * Examples of this include:
 * 1) Operations (such as a query)
 * 2) Fragments
 *
 * "Operations" are a generic name for requests in the document.
 * Examples of this include:
 * 1) query,
 * 2) mutation
 *
 * "Selections" are the definitions that can appear legally and at
 * single level of the query. These include:
 * 1) field references e.g "a"
 * 2) fragment "spreads" e.g. "...c"
 * 3) inline fragment "spreads" e.g. "...on Type { a }"
 */

/**
 * The result of GraphQL execution.
 *
 *   - `errors` is included when any errors occurred as a non-empty array.
 *   - `data` is the result of a successful execution of the query.
 */ export interface ExecutionResult {
  readonly errors?: ReadonlyArray<GraphQLError>;
  readonly data?: ObjMap<{}>;
}
export interface ExecutionArgs {
  readonly schema: GraphQLSchema;
  readonly document: DocumentNode;
  readonly rootValue?: any;
  readonly contextValue?: any;
  readonly variableValues?: { readonly [variable: string]: any } | null;
  readonly operationName?: string | null;
  readonly fieldResolver?: GraphQLFieldResolver<any, any> | null;
}

/**
 * This function transforms a JS object `ObjMap<Promise<T>>` into
 * a `Promise<ObjMap<T>>`
 *
 * This is akin to bluebird's `Promise.props`, but implemented only using
 * `Promise.all` so it will work with any implementation of ES6 promises.
 */
function promiseForObject<T>(object: ObjMap<Promise<T>>): Promise<ObjMap<T>> {
  const keys = Object.keys(object);
  const valuesAndPromises = keys.map((name) => object[name]);
  return Promise.all(valuesAndPromises).then((values) =>
    values.reduce((resolvedObject, value, i) => {
      resolvedObject[keys[i]] = value;
      return resolvedObject;
    }, Object.create(null)),
  );
}

/**
 * Resolves the field on the given source object. In particular, this
 * figures out the value that the field returns by calling its resolve function,
 * then calls completeValue to complete promises, serialize scalars, or execute
 * the sub-selection-set for objects.
 */
export function resolveField(
  exeContext: ExecutionContext,
  parentType: GraphQLObjectType,
  source: any,
  fieldNodes: ReadonlyArray<FieldNode>,
  path: Path,
): any {
  const fieldNode = fieldNodes[0];
  const fieldName = fieldNode.name.value;

  const fieldDef = getFieldDef(exeContext.schema, parentType, fieldName);
  if (!fieldDef) {
    return undefined;
  }

  const resolveFn = fieldDef.resolve || exeContext.fieldResolver;

  const info = buildResolveInfo(exeContext, fieldDef, fieldNodes, parentType, path);

  // Get the resolve function, regardless of if its result is normal
  // or abrupt (error).
  const result = resolveFieldValueOrError(exeContext, fieldDef, fieldNodes, resolveFn, source, info);

  return completeValueCatchingError(exeContext, fieldDef.type, fieldNodes, info, path, result);
}

/**
 * Implements the "Evaluating selection sets" section of the spec
 * for "read" mode.
 */
function executeFields(
  exeContext: ExecutionContext,
  parentType: GraphQLObjectType,
  sourceValue: any,
  path: Path | void,
  fields: ObjMap<ReadonlyArray<FieldNode>>,
): MaybePromise<ObjMap<{}>> {
  let containsPromise = false;

  const finalResults = Object.keys(fields).reduce((results, responseName) => {
    const fieldNodes = fields[responseName];
    const fieldPath = addPath(path as any, responseName);
    const result = resolveField(exeContext, parentType, sourceValue, fieldNodes, fieldPath);

    if (result === undefined) {
      return results;
    }
    results[responseName] = result;
    if (!containsPromise && isPromise(result)) {
      containsPromise = true;
    }
    return results;
  }, Object.create(null));

  // If there are no promises, we can just return the object
  if (!containsPromise) {
    return finalResults;
  }

  // Otherwise, results is a map from field name to the result
  // of resolving that field, which is possibly a promise. Return
  // a promise that will return this same map, but with any
  // promises replaced with the values they resolved to.
  return promiseForObject(finalResults);
}

/**
 * Implements the logic to compute the key of a given field's entry
 */
export function getFieldEntryKey(node: FieldNode): string {
  return node.alias ? node.alias.value : node.name.value;
}

// This is a small wrapper around completeValue which annotates errors with
// location information.
function completeValueWithLocatedError(
  exeContext: ExecutionContext,
  returnType: GraphQLOutputType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): any {
  try {
    const completed = completeValue(exeContext, returnType, fieldNodes, info, path, result);

    if (isPromise(completed)) {
      return completed.then(null, (error: any) =>
        Promise.reject(locatedError(asErrorInstance(error), fieldNodes, pathToArray(path))),
      );
    }
    return completed;
  } catch (error) {
    throw locatedError(asErrorInstance(error), fieldNodes, pathToArray(path));
  }
}

// This is a small wrapper around completeValue which detects and logs errors
// in the execution context.
function completeValueCatchingError(
  exeContext: ExecutionContext,
  returnType: GraphQLOutputType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): any {
  // If the field type is non-nullable, then it is resolved without any
  // protection from errors, however it still properly locates the error.
  if (isNonNullType(returnType)) {
    return completeValueWithLocatedError(exeContext, returnType, fieldNodes, info, path, result);
  }

  // Otherwise, error protection is applied, logging the error and resolving
  // a null value for this field if one is encountered.
  try {
    const completed = completeValueWithLocatedError(exeContext, returnType, fieldNodes, info, path, result);

    if (isPromise(completed)) {
      // If `completeValueWithLocatedError` returned a rejected promise, log
      // the rejection error and resolve to null.
      // Note: we don't rely on a `catch` method, but we do expect "thenable"
      // to take a second callback for the error case.
      return completed.then(null, (error: any) => {
        exeContext.errors.push(error);
        return Promise.resolve(null);
      });
    }
    return completed;
  } catch (error) {
    // If `completeValueWithLocatedError` returned abruptly (threw an error),
    // log the error and return null.
    exeContext.errors.push(error);
    return null;
  }
}

/**
 * Implements the instructions for completeValue as defined in the
 * "Field entries" section of the spec.
 *
 * If the field type is Non-Null, then this recursively completes the value
 * for the inner type. It throws a field error if that completion returns null,
 * as per the "Nullability" section of the spec.
 *
 * If the field type is a List, then this recursively completes the value
 * for the inner type on each item in the list.
 *
 * If the field type is a Scalar or Enum, ensures the completed value is a legal
 * value of the type by calling the `serialize` method of GraphQL type
 * definition.
 *
 * If the field is an abstract type, determine the runtime type of the value
 * and then complete based on that type
 *
 * Otherwise, the field type expects a sub-selection set, and will complete the
 * value by evaluating all sub-selections.
 */
function completeValue(
  exeContext: ExecutionContext,
  returnType: GraphQLOutputType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): any {
  // If result is a Promise, apply-lift over completeValue.
  if (isPromise(result)) {
    return result.then((resolved: any) => completeValue(exeContext, returnType, fieldNodes, info, path, resolved));
  }

  // If result is an Error, throw a located error.
  if (result instanceof Error) {
    throw result;
  }

  // If field type is NonNull, complete for inner type, and throw field error
  // if result is null.
  if (isNonNullType(returnType)) {
    const completed = completeValue(exeContext, returnType.ofType, fieldNodes, info, path, result);

    if (completed === null) {
      throw new Error(`Cannot return null for non-nullable field ${info.parentType.name}.${info.fieldName}.`);
    }
    return completed;
  }

  // If result value is null-ish (null, null, or NaN) then return null.
  if (isNullish(result)) {
    return null;
  }

  // If field type is List, complete each item in the list with the inner type
  if (isListType(returnType)) {
    return completeListValue(exeContext, returnType, fieldNodes, info, path, result);
  }

  // If field type is a leaf type, Scalar or Enum, serialize to a valid value,
  // returning null if serialization is not possible.
  if (isLeafType(returnType)) {
    return completeLeafValue(returnType, result);
  }

  // If field type is an abstract type, Interface or Union, determine the
  // runtime Object type and complete for that type.
  if (isAbstractType(returnType)) {
    return completeAbstractValue(exeContext, returnType, fieldNodes, info, path, result);
  }

  // If field type is Object, execute and complete all sub-selections.
  if (isObjectType(returnType)) {
    return completeObjectValue(exeContext, returnType, fieldNodes, info, path, result);
  }

  // Not reachable. All possible output types have been considered.
  /* istanbul ignore next */
  throw new Error(`Cannot complete value of unexpected type "${String(returnType)}".`);
}

/**
 * Complete a list value by completing each item in the list with the
 * inner type
 */
function completeListValue(
  exeContext: ExecutionContext,
  returnType: GraphQLList<GraphQLOutputType>,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): any {
  invariant(
    isCollection(result),
    `Expected Iterable, but did not find one for field ${info.parentType.name}.${info.fieldName}.`,
  );

  // This is specified as a simple map, however we're optimizing the path
  // where the list contains no Promises by avoiding creating another Promise.
  const itemType = returnType.ofType;
  let containsPromise = false;
  const completedResults: any[] = [];
  forEach(result as any, (item, index) => {
    // No need to modify the info object containing the path,
    // since from here on it is not ever accessed by resolver functions.
    const fieldPath = addPath(path, index);
    const completedItem = completeValueCatchingError(exeContext, itemType, fieldNodes, info, fieldPath, item);

    if (!containsPromise && isPromise(completedItem)) {
      containsPromise = true;
    }
    completedResults.push(completedItem);
  });

  return containsPromise ? Promise.all(completedResults) : completedResults;
}

/**
 * Complete a Scalar or Enum by serializing to a valid value, returning
 * null if serialization is not possible.
 */
function completeLeafValue(returnType: GraphQLLeafType, result: any): any {
  invariant(returnType.serialize, 'Missing serialize method on type');
  const serializedResult = returnType.serialize(result);
  if (isInvalid(serializedResult)) {
    throw new Error(`Expected a value of type "${String(returnType)}" but ` + `received: ${String(result)}`);
  }
  return serializedResult;
}

/**
 * Complete a value of an abstract type by determining the runtime object type
 * of that value, then complete the value for that type.
 */
function completeAbstractValue(
  exeContext: ExecutionContext,
  returnType: GraphQLAbstractType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): any {
  const runtimeType = returnType.resolveType
    ? returnType.resolveType(result, exeContext.contextValue, info, returnType)
    : defaultResolveTypeFn(result, exeContext.contextValue, info, returnType);

  if (isPromise(runtimeType)) {
    return (runtimeType as any).then((resolvedRuntimeType: any) =>
      completeObjectValue(
        exeContext,
        ensureValidRuntimeType(resolvedRuntimeType, exeContext, returnType, fieldNodes, info, result),

        fieldNodes,
        info,
        path,
        result,
      ),
    );
  }

  return completeObjectValue(
    exeContext,
    ensureValidRuntimeType(
      (runtimeType as any) as GraphQLObjectType | null | string,
      exeContext,
      returnType,
      fieldNodes,
      info,
      result,
    ),

    fieldNodes,
    info,
    path,
    result,
  );
}

function ensureValidRuntimeType(
  runtimeTypeOrName: GraphQLObjectType | null | string,
  exeContext: ExecutionContext,
  returnType: GraphQLAbstractType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  result: any,
): GraphQLObjectType {
  const runtimeType =
    typeof runtimeTypeOrName === 'string' ? exeContext.schema.getType(runtimeTypeOrName) : runtimeTypeOrName;

  if (!isObjectType(runtimeType as any)) {
    throw new GraphQLError(
      `Abstract type ${returnType.name} must resolve to an Object type at ` +
        `runtime for field ${info.parentType.name}.${info.fieldName} with ` +
        `value "${String(result)}", received "${String(runtimeType)}". ` +
        `Either the ${returnType.name} type should provide a "resolveType" ` +
        'function or each possible types should provide an ' +
        '"isTypeOf" function.',
      fieldNodes,
    );
  }

  if (!exeContext.schema.isPossibleType(returnType, runtimeType as any)) {
    throw new GraphQLError(
      `Runtime Object type "${(runtimeType as any).name}" is not a possible type ` + `for "${returnType.name}".`,
      fieldNodes,
    );
  }

  return runtimeType as any;
}

/**
 * Complete an Object value by executing all sub-selections.
 */
function completeObjectValue(
  exeContext: ExecutionContext,
  returnType: GraphQLObjectType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): any {
  // If there is an isTypeOf predicate function, call it with the
  // current result. If isTypeOf returns false, then raise an error rather
  // than continuing execution.
  if (returnType.isTypeOf) {
    const isTypeOf = returnType.isTypeOf(result, exeContext.contextValue, info);

    if (isPromise(isTypeOf)) {
      return (isTypeOf as any).then((isTypeOfResult: any) => {
        if (!isTypeOfResult) {
          throw invalidReturnTypeError(returnType, result, fieldNodes);
        }
        return collectAndExecuteSubfields(exeContext, returnType, fieldNodes, info, path, result);
      });
    }

    if (!isTypeOf) {
      throw invalidReturnTypeError(returnType, result, fieldNodes);
    }
  }

  return collectAndExecuteSubfields(exeContext, returnType, fieldNodes, info, path, result);
}

function invalidReturnTypeError(
  returnType: GraphQLObjectType,
  result: any,
  fieldNodes: ReadonlyArray<FieldNode>,
): GraphQLError {
  return new GraphQLError(`Expected value of type "${returnType.name}" but got: ${String(result)}.`, fieldNodes);
}

function collectAndExecuteSubfields(
  exeContext: ExecutionContext,
  returnType: GraphQLObjectType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): any {
  // Collect sub-fields to execute to complete this value.
  const subFieldNodes = collectSubfields(exeContext, returnType, fieldNodes);
  return executeFields(exeContext, returnType, result, path, subFieldNodes);
}

const collectSubfields = memoize3(_collectSubfields);
function _collectSubfields(
  exeContext: ExecutionContext,
  returnType: GraphQLObjectType,
  fieldNodes: ReadonlyArray<FieldNode>,
): ObjMap<ReadonlyArray<FieldNode>> {
  let subFieldNodes = Object.create(null);
  const visitedFragmentNames = Object.create(null);
  for (let i = 0; i < fieldNodes.length; i += 1) {
    const selectionSet = fieldNodes[i].selectionSet;
    if (selectionSet) {
      subFieldNodes = collectFields(exeContext, returnType, selectionSet, subFieldNodes, visitedFragmentNames);
    }
  }
  return subFieldNodes;
}

function defaultResolveTypeFn(
  value: any,
  context: any,
  info: GraphQLResolveInfo,
  abstractType: GraphQLAbstractType,
): GraphQLObjectType | undefined | string | Promise<GraphQLObjectType | undefined | string> {
  // First, look for `__typename`.
  if (value !== null && typeof value === 'object' && typeof value.__typename === 'string') {
    return value.__typename;
  }

  // Otherwise, test each possible type.
  const possibleTypes = info.schema.getPossibleTypes(abstractType);
  const promisedIsTypeOfResults = [];

  for (let i = 0; i < possibleTypes.length; i += 1) {
    const type = possibleTypes[i];

    if (type.isTypeOf) {
      const isTypeOfResult = type.isTypeOf(value, context, info);

      if (isPromise(isTypeOfResult)) {
        promisedIsTypeOfResults[i] = isTypeOfResult;
      } else if (isTypeOfResult) {
        return type;
      }
    }
  }

  if (promisedIsTypeOfResults.length) {
    return Promise.all(promisedIsTypeOfResults).then((isTypeOfResults) => {
      for (let i = 0; i < isTypeOfResults.length; i += 1) {
        if (isTypeOfResults[i]) {
          return possibleTypes[i];
        }
      }

      return undefined;
    });
  }

  return undefined;
}

function asErrorInstance(error: any): Error {
  return error instanceof Error ? error : new Error(error == null ? null : error);
}

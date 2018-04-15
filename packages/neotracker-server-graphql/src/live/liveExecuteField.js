/* @flow */
import { type GraphQLResolveInfo, defaultFieldResolver } from 'graphql';
import { type Observable } from 'rxjs/Observable';

import { switchMap } from 'rxjs/operators';

import type { GraphQLContext } from '../GraphQLContext';
import type { GraphQLLiveResolver } from '../constants';

import { convertExecutionResult } from '../createQueryDeduplicator';
import { getFieldEntryKey, resolveField } from './utils';
import liveMemoized from './liveMemoized';

export type MapFn<In, Out> = (
  value: In,
  args: { [key: string]: any },
  context: GraphQLContext,
  info: GraphQLResolveInfo,
) => Promise<Out>;

export default function<TSource>(
  observable: (
    rootValue: TSource,
    args: { [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ) => Observable<mixed>,
): GraphQLLiveResolver<TSource> {
  return liveMemoized(
    (
      rootValue: TSource,
      args: { [key: string]: any },
      context: GraphQLContext,
      info: GraphQLResolveInfo,
    ) =>
      observable(rootValue, args, context, info).pipe(
        switchMap(payload =>
          Promise.resolve().then(async () => {
            const executionContext = {
              schema: info.schema,
              fragments: info.fragments,
              rootValue: info.rootValue,
              operation: info.operation,
              variableValues: info.variableValues,
              contextValue: context,
              fieldResolver: defaultFieldResolver,
              errors: [],
            };
            let response = {};
            try {
              const result = await resolveField(
                executionContext,
                // $FlowFixMe
                info.parentType,
                payload,
                info.fieldNodes,
                info.path,
              );
              response = {
                data: { [getFieldEntryKey(info.fieldNodes[0])]: result },
              };
            } catch (error) {
              executionContext.errors.push(error);
            }

            response = { ...response, errors: executionContext.errors };
            return convertExecutionResult(response, context.getMonitor(info));
          }),
        ),
      ),
  );
}

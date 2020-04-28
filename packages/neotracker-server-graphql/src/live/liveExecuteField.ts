import { serverLogger } from '@neotracker/logger';
import { defaultFieldResolver, GraphQLResolveInfo } from 'graphql';
import { ExecutionContext } from 'graphql/execution/execute';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GraphQLLiveResolver } from '../constants';
import { convertExecutionResult } from '../createQueryDeduplicator';
import { GraphQLContext } from '../GraphQLContext';
import { liveMemoized } from './liveMemoized';
import { getFieldEntryKey, resolveField } from './utils';
export type MapFn<In, Out> = (
  value: In,
  // tslint:disable-next-line no-any
  args: { readonly [key: string]: any },
  context: GraphQLContext,
  info: GraphQLResolveInfo,
) => Promise<Out>;

export function liveExecuteField<TSource>(
  observable: (
    rootValue: TSource,
    // tslint:disable-next-line no-any
    args: { readonly [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ) => Observable<{}>,
): GraphQLLiveResolver<TSource> {
  // tslint:disable-next-line no-any
  return liveMemoized((rootValue: TSource, args: { [key: string]: any }, context, info) =>
    observable(rootValue, args, context, info).pipe(
      switchMap(async (payload) => {
        const executionContext: ExecutionContext = {
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
          const result = await resolveField(executionContext, info.parentType, payload, info.fieldNodes, info.path);

          response = {
            data: { [getFieldEntryKey(info.fieldNodes[0])]: result },
          };
        } catch (error) {
          // tslint:disable-next-line no-array-mutation
          executionContext.errors.push(error);
          serverLogger.error({
            title: 'live_execute_field_error',
            key: getFieldEntryKey(info.fieldNodes[0]),
            source: payload,
            args,
            fieldName: info.fieldNodes[0].name.value,
            operation:
              executionContext.operation.name === undefined ? undefined : executionContext.operation.name.value,
          });
        }

        response = { ...response, errors: executionContext.errors };

        return convertExecutionResult(response);
      }),
    ),
  );
}

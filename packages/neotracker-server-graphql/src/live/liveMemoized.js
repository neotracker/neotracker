/* @flow */
import type { ExecutionResult } from 'neotracker-shared-graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { type Observable, of as _of } from 'rxjs';
import stringify from 'safe-stable-stringify';

import { catchError, finalize, publishReplay, refCount } from 'rxjs/operators';

import type { GraphQLContext } from '../GraphQLContext';
import type { GraphQLLiveResolver } from '../constants';

import collectArgumentValues from './collectArgumentValues';
import { formatError } from '../createQueryDeduplicator';
import { getFieldEntryKey } from './utils';

const memoized$ = {};
export default function<TSource>(
  observable: (
    rootValue: TSource,
    args: { [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ) => Observable<ExecutionResult>,
): GraphQLLiveResolver<TSource> {
  return (
    rootValue: TSource,
    args: { [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ): Observable<ExecutionResult> => {
    if (memoized$[context.queryID] == null) {
      memoized$[context.queryID] = {};
    }

    const node = info.fieldNodes[0];
    const argumentValues = collectArgumentValues(
      info.schema,
      info.parentType,
      node,
      info.variableValues,
    );
    const key = stringify(argumentValues);
    if (memoized$[context.queryID][key] == null) {
      memoized$[context.queryID][key] = {};
    }

    const responseName = getFieldEntryKey(node);
    if (memoized$[context.queryID][key][responseName] == null) {
      memoized$[context.queryID][key][responseName] = observable(
        rootValue,
        args,
        context,
        info,
      ).pipe(
        catchError(error =>
          _of({
            errors: [
              formatError(
                context.getMonitor(info),
                'graphql_live_memoized_error',
                error,
              ),
            ],
          }),
        ),
        finalize(() => {
          delete memoized$[context.queryID][key][responseName];
        }),
        publishReplay(1),
        refCount(),
      );
    }

    return memoized$[context.queryID][key][responseName];
  };
}

import { ExecutionResult } from '@neotracker/shared-graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Observable, of as _of } from 'rxjs';
import { catchError, finalize, publishReplay, refCount } from 'rxjs/operators';
import stringify from 'safe-stable-stringify';
import { GraphQLLiveResolver } from '../constants';
import { formatError } from '../createQueryDeduplicator';
import { GraphQLContext } from '../GraphQLContext';
import { collectArgumentValues } from './collectArgumentValues';
import { getFieldEntryKey } from './utils';

interface MemoizedMap {
  // tslint:disable-next-line readonly-keyword no-any
  [key: string]: Observable<any>;
}
interface MemoizedMapMap {
  // tslint:disable-next-line readonly-keyword no-any
  [key: string]: MemoizedMap;
}
// tslint:disable-next-line readonly-keyword
const mutableMemoized$: { [key: string]: MemoizedMapMap } = {};
export function liveMemoized<TSource>(
  observable$: (
    rootValue: TSource,
    // tslint:disable-next-line no-any
    args: { readonly [key: string]: any },
    context: GraphQLContext,
    info: GraphQLResolveInfo,
  ) => Observable<ExecutionResult>,
): GraphQLLiveResolver<TSource> {
  return (
    rootValue: TSource,
    // tslint:disable-next-line no-any
    args: { [key: string]: any },
    context,
    info,
  ): Observable<ExecutionResult> => {
    if ((mutableMemoized$[context.queryID] as MemoizedMapMap | undefined) === undefined) {
      mutableMemoized$[context.queryID] = {};
    }

    const node = info.fieldNodes[0];
    const argumentValues = collectArgumentValues(info.schema, info.parentType, node, info.variableValues);

    const key = stringify(argumentValues);
    if ((mutableMemoized$[context.queryID][key] as MemoizedMap | undefined) === undefined) {
      mutableMemoized$[context.queryID][key] = {};
    }

    const responseName = getFieldEntryKey(node);
    // tslint:disable-next-line no-any
    if ((mutableMemoized$[context.queryID][key][responseName] as Observable<any> | undefined) === undefined) {
      mutableMemoized$[context.queryID][key][responseName] = observable$(rootValue, args, context, info).pipe(
        catchError((error) =>
          _of({
            errors: [formatError('graphql_live_memoized_error', error)],
          }),
        ),
        finalize(() => {
          // tslint:disable-next-line no-dynamic-delete
          delete mutableMemoized$[context.queryID][key][responseName];
        }),
        publishReplay(1),
        refCount(),
      );
    }

    return mutableMemoized$[context.queryID][key][responseName];
  };
}

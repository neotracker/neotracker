import { OperationVariables, WatchQueryFetchPolicy } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { useContext, useEffect } from 'react';
import { filter, map, take } from 'rxjs/operators';
import { AppContext } from '../../AppContext';
import {
  isResolvedQueryResult,
  observeQuery,
  ObserveQueryOptions,
  QueryResult,
  ResolvedQueryResult,
} from '../../utils';
import { useStream } from './useStream';
import { WithAppContextBase } from './WithAppContext';

// tslint:disable-next-line: no-unused
export interface QueryProps<_TData, TVariables> {
  readonly variables?: TVariables;
  readonly notifyOnNetworkStatusChange?: boolean;
}
export interface Props<TData, TVariables> extends QueryProps<TData, TVariables> {
  readonly query: DocumentNode;
  readonly appContext: AppContext;
}

interface GetObserveQueryOptions<TVariables> {
  readonly query: DocumentNode;
  readonly appContext: AppContext;
  readonly variables?: TVariables;
  readonly notifyOnNetworkStatusChange?: boolean;
  readonly fetchPolicy?: WatchQueryFetchPolicy;
}

function getObserveQueryOptions<TVariables>({
  appContext: { apollo },
  query,
  variables,
  notifyOnNetworkStatusChange = false,
  fetchPolicy = 'cache-and-network',
}: GetObserveQueryOptions<TVariables>): ObserveQueryOptions<TVariables> {
  return {
    apollo,
    query,
    variables: variables as TVariables,
    fetchPolicy,
    notifyOnNetworkStatusChange,
  };
}

export type UseQueryResult<TData, TVariables> = readonly [
  QueryResult<TData, TVariables> | undefined,
  (appContext: AppContext, variables?: TVariables) => Promise<void>,
];

export interface Options<TData, TVariables> {
  readonly query: DocumentNode;
  readonly fetchNextData?: (appContext: AppContext, result: ResolvedQueryResult<TData, TVariables>) => Promise<void>;
  readonly notifyOnNetworkStatusChange?: boolean;
  readonly variables?: TVariables;
}

export const useQuery = <TData, TVariables = OperationVariables>({
  query,
  fetchNextData,
  notifyOnNetworkStatusChange,
  variables,
}: Options<TData, TVariables>): UseQueryResult<TData, TVariables> => {
  async function fetchData(appContextIn: AppContext): Promise<void> {
    const result = await observeQuery<TData, TVariables>(
      getObserveQueryOptions({ appContext: appContextIn, query, variables, fetchPolicy: 'cache-first' }),
    )
      .pipe(
        map((value) => {
          if (value.error !== undefined) {
            throw value.error;
          }

          return value;
        }),
        filter(isResolvedQueryResult),
        take(1),
      )
      .toPromise();

    if (fetchNextData !== undefined) {
      await fetchNextData(appContextIn, result);
    }
  }

  const appContext = useContext(WithAppContextBase);

  return [
    useStream(
      () =>
        observeQuery<TData, TVariables>(
          getObserveQueryOptions({
            query,
            appContext,
            notifyOnNetworkStatusChange,
            variables,
          }),
        ),
      [],
    ),
    fetchData,
  ] as const;
};

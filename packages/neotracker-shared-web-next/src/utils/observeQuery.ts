import ApolloClient, { ApolloError, FetchPolicy, NetworkStatus, OperationVariables } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { Observable, Observer } from 'rxjs';

interface QueryResultBase<TVariables> {
  readonly variables: TVariables;
  readonly networkStatus: NetworkStatus;
  readonly loading: boolean;
  readonly error?: ApolloError;
}
export interface ResolvedQueryResult<TData, TVariables> extends QueryResultBase<TVariables> {
  readonly type: 'resolved';
  readonly data: TData;
}

export function isResolvedQueryResult<TData, TVariables>(
  result: QueryResult<TData, TVariables>,
): result is ResolvedQueryResult<TData, TVariables> {
  return result.type === 'resolved';
}

export interface UnresolvedQueryResult<TData, TVariables> extends QueryResultBase<TVariables> {
  readonly type: 'unresolved';
  readonly data: Partial<TData>;
}

export function isUnresolvedQueryResult<TData, TVariables>(
  result: QueryResult<TData, TVariables>,
): result is UnresolvedQueryResult<TData, TVariables> {
  return result.type === 'unresolved';
}

export type QueryResult<TData, TVariables = OperationVariables> =
  | ResolvedQueryResult<TData, TVariables>
  | UnresolvedQueryResult<TData, TVariables>;

export interface ObserveQueryOptions<TVariables> {
  // tslint:disable-next-line no-any
  readonly apollo: ApolloClient<any>;
  readonly query: DocumentNode;
  readonly variables?: TVariables;
  readonly fetchPolicy?: FetchPolicy;
  readonly notifyOnNetworkStatusChange?: boolean;
}

export const observeQuery = <TData, TVariables = OperationVariables>({
  apollo,
  query,
  variables,
  fetchPolicy = 'cache-first',
  notifyOnNetworkStatusChange = false,
}: ObserveQueryOptions<TVariables>): Observable<QueryResult<TData, TVariables>> =>
  new Observable((observer: Observer<QueryResult<TData, TVariables>>) => {
    const queryObservable$ = apollo.watchQuery<TData>({
      query,
      variables,
      fetchPolicy,
      errorPolicy: 'all',
      fetchResults: true,
      notifyOnNetworkStatusChange,
      context: {},
    });

    const next = () => {
      const currentResult = queryObservable$.currentResult();
      const { data, errors, loading, networkStatus, partial } = currentResult;
      let { error } = currentResult;

      if (errors !== undefined && errors.length > 0) {
        error = new ApolloError({ graphQLErrors: errors });
      }

      if (partial) {
        observer.next({
          type: 'unresolved',
          data,
          variables: variables as TVariables,
          loading,
          error,
          networkStatus,
        });
      } else {
        observer.next({
          type: 'resolved',
          data: data as TData,
          variables: variables as TVariables,
          loading,
          error,
          networkStatus,
        });
      }
    };

    let subscription: { unsubscribe: () => void } | undefined;
    const unsubscribe = () => {
      if (subscription !== undefined) {
        subscription.unsubscribe();
        subscription = undefined;
      }
    };
    const resubscribe = () => {
      unsubscribe();
      // If lastError is set, the observable will immediately
      // send it, causing the stream to terminate on initialization.
      // We clear everything here and restore it afterward to
      // make sure the new subscription sticks.
      queryObservable$.resetLastResults();
      subscribe();
    };
    const subscribe = () => {
      subscription = queryObservable$.subscribe({
        next: () => {
          next();
        },
        error: (error: Error) => {
          resubscribe();

          // If it has graphQLErrors it's an ApolloError and is already captured as data.
          // Throw other errors.
          if (!error.hasOwnProperty('graphQLErrors')) {
            throw error;
          }

          next();
        },
        complete: observer.complete,
      });
    };

    subscribe();
    next();

    return () => {
      unsubscribe();
    };
  });

import { FetchPolicy, OperationVariables } from 'apollo-client';
import { DocumentNode } from 'graphql';
import _ from 'lodash';
import * as React from 'react';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AppContext } from '../../AppContext';
import {
  isResolvedQueryResult,
  observeQuery,
  ObserveQueryOptions,
  QueryResult,
  ResolvedQueryResult,
} from '../../utils';
import { FromStream } from './FromStream';
import { WithAppContext } from './WithAppContext';

export interface QueryProps<TData, TVariables> {
  readonly children: (result: QueryResult<TData, TVariables>) => React.ReactNode;
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
  readonly fetchPolicy?: FetchPolicy;
}

function getObserveQueryOptions<TVariables>({
  appContext: { apollo },
  query,
  variables,
  notifyOnNetworkStatusChange = false,
  fetchPolicy = 'cache-first',
}: GetObserveQueryOptions<TVariables>): ObserveQueryOptions<TVariables> {
  return {
    apollo,
    query,
    variables: variables as TVariables,
    fetchPolicy,
    notifyOnNetworkStatusChange,
  };
}

class QueryBase<TData, TVariables = OperationVariables> extends React.Component<Props<TData, TVariables>> {
  private mutableResult$: Observable<QueryResult<TData, TVariables>>;

  public constructor(props: Props<TData, TVariables>) {
    super(props);

    this.mutableResult$ = observeQuery(getObserveQueryOptions(props));
  }

  public UNSAFE_componentWillReceiveProps(nextProps: Props<TData, TVariables>): void {
    if (
      // tslint:disable-next-line: strict-comparisons
      this.props.appContext.apollo !== nextProps.appContext.apollo ||
      // tslint:disable-next-line: strict-comparisons
      this.props.query !== nextProps.query ||
      // tslint:disable-next-line: strict-comparisons
      this.props.notifyOnNetworkStatusChange !== nextProps.notifyOnNetworkStatusChange ||
      !_.isEqual(this.props.variables, nextProps.variables)
    ) {
      this.mutableResult$ = observeQuery(getObserveQueryOptions(nextProps));
    }
  }

  public render(): React.ReactNode {
    return <FromStream props$={this.mutableResult$}>{this.props.children}</FromStream>;
  }
}

export interface QueryClass<TData, TVariables> extends React.ComponentClass<QueryProps<TData, TVariables>> {
  readonly fetchData: (appContext: AppContext, variables?: TVariables) => Promise<void>;
}
export interface Options<TData, TVariables> {
  readonly query: DocumentNode;
  readonly fetchNextData?: (appContext: AppContext, result: ResolvedQueryResult<TData, TVariables>) => Promise<void>;
}
export const makeQuery = <TData, TVariables = OperationVariables>({
  query,
  fetchNextData,
}: Options<TData, TVariables>): QueryClass<TData, TVariables> => {
  class Query extends React.Component<QueryProps<TData, TVariables>> {
    public static async fetchData(appContext: AppContext, variables?: TVariables): Promise<void> {
      const result = await observeQuery<TData, TVariables>(
        getObserveQueryOptions({ appContext, query, variables, fetchPolicy: 'cache-first' }),
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
        await fetchNextData(appContext, result);
      }
    }

    public render(): React.ReactNode {
      return (
        <WithAppContext>
          {(appContext) => (
            <QueryBase {...this.props} query={query} appContext={appContext}>
              {this.props.children}
            </QueryBase>
          )}
        </WithAppContext>
      );
    }
  }

  return Query;
};

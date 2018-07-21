/* @flow */
import {
  type ConnectionConfig,
  type GraphQLTaggedNode,
  createPaginationContainer,
} from 'react-relay';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';
import * as React from 'react';

import { compose, withHandlers, withStateHandlers } from 'recompose';

type Config = {
  pageSize: number,
};

export default (
  fragments: { [key: string]: GraphQLTaggedNode },
  connectionConfig: ConnectionConfig,
  config?: Config,
) =>
  compose(
    (WrappedComponent: React.ComponentType<any>) =>
      createPaginationContainer(WrappedComponent, fragments, connectionConfig),
    withStateHandlers(
      () => ({
        isLoadingMore: false,
        error: null,
      }),
      {
        setState: (prevState) => (updater) => updater(prevState),
      },
    ),
    withHandlers({
      onLoadMore: ({ relay, setState }) => () => {
        if (relay.hasMore() && !relay.isLoading()) {
          setState((prevState) => ({
            ...prevState,
            isLoadingMore: true,
            error: null,
          }));
          relay.loadMore((config || { pageSize: 10 }).pageSize, (error) => {
            setState((prevState) => ({
              ...prevState,
              isLoadingMore: false,
              error: error == null ? null : sanitizeError(error).message,
            }));
          });
        }
      },
    }),
  );

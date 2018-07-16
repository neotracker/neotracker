import { Monitor } from '@neo-one/monitor';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { LiveLink } from './LiveLink';

export const createApolloClient = ({
  monitor,
  endpoint,
  apolloState,
}: {
  readonly monitor: Monitor;
  readonly endpoint: string;
  readonly apolloState: NormalizedCacheObject;
}) => {
  const liveLink = new LiveLink({
    endpoint,
    monitor,
  });

  const errorLink = onError(({ networkError }) => {
    if (networkError !== undefined) {
      monitor.logError({
        name: 'graphql_network_error',
        error: networkError,
      });
    }
  });

  return new ApolloClient({
    link: ApolloLink.from([errorLink, liveLink]),
    cache: new InMemoryCache({
      addTypename: false,
    }).restore(apolloState),
    queryDeduplication: false,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: false,
      },
      query: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};

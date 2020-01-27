import { clientLogger } from '@neotracker/logger';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import debug from 'debug';
import { LiveLink } from './LiveLink';

export const createApolloClient = ({
  labels,
  endpoint,
  apolloState,
}: {
  readonly labels: Record<string, string>;
  readonly endpoint: string;
  readonly apolloState: NormalizedCacheObject;
}) => {
  const liveLink = new LiveLink({
    endpoint,
    labels,
  });

  const logger = debug('NEOTRACKER:CreateApolloClient');

  const errorLink = onError(({ networkError }) => {
    if (networkError !== undefined) {
      const logInfo = {
        title: 'graphql_network_error',
        error: networkError.message,
        ...labels,
      };
      clientLogger.error({ ...logInfo });
      logger('%o', {
        level: 'error',
        ...logInfo,
        message: 'Something went wrong when creating ApolloClient.',
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
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    } as const,
  });
};

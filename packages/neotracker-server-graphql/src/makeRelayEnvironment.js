/* @flow */
import { Environment, RecordSource, Store, Network } from 'relay-runtime';
import { type GraphQLSchema } from 'graphql';
import { type RootLoader } from 'neotracker-server-db';
import type { Monitor } from '@neo-one/monitor';

import type RelaySSRQueryCache from './RelaySSRQueryCache';
import QueryMap from './QueryMap';

import createQueryDeduplicator from './createQueryDeduplicator';

function createNetwork(
  monitorIn: Monitor,
  rootLoader: RootLoader,
  schema: GraphQLSchema,
  relaySSRQueryCache: RelaySSRQueryCache,
): Network {
  const queryDeduplicator = createQueryDeduplicator(
    monitorIn,
    schema,
    new QueryMap(),
    rootLoader,
  );
  return Network.create((operation, variables, { monitor }) => {
    const cachedResult = relaySSRQueryCache.get(operation.id, variables);
    if (cachedResult != null) {
      return cachedResult;
    }

    return queryDeduplicator
      .execute({ id: operation.id, variables, monitor })
      .then(result => {
        relaySSRQueryCache.add(operation.id, variables, result);
        return result;
      });
  });
}

export default function({
  monitor,
  rootLoader,
  schema,
  relaySSRQueryCache,
}: {|
  monitor: Monitor,
  rootLoader: RootLoader,
  schema: GraphQLSchema,
  relaySSRQueryCache: RelaySSRQueryCache,
|}) {
  return new Environment({
    network: createNetwork(monitor, rootLoader, schema, relaySSRQueryCache),
    store: new Store(new RecordSource()),
  });
}

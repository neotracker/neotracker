import { Monitor } from '@neo-one/monitor';
import { GraphQLSchema } from 'graphql';
import { RootLoader } from 'neotracker-server-db';
// @ts-ignore
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import { createQueryDeduplicator } from './createQueryDeduplicator';
import { QueryMap } from './QueryMap';
import { RelaySSRQueryCache } from './RelaySSRQueryCache';

function createNetwork(
  monitorIn: Monitor,
  rootLoader: RootLoader,
  schema: GraphQLSchema,
  relaySSRQueryCache: RelaySSRQueryCache,
): Network {
  const queryDeduplicator = createQueryDeduplicator(monitorIn, schema, new QueryMap(), rootLoader);

  // tslint:disable-next-line no-any
  return Network.create((operation: any, variables: any, { monitor }: any) => {
    const cachedResult = relaySSRQueryCache.get(operation.id, variables);
    if (cachedResult != undefined) {
      return cachedResult;
    }

    return queryDeduplicator.execute({ id: operation.id, variables, monitor }).then((result) => {
      relaySSRQueryCache.add(operation.id, variables, result);

      return result;
    });
  });
}

export function makeRelayEnvironment({
  monitor,
  rootLoader,
  schema,
  relaySSRQueryCache,
}: {
  readonly monitor: Monitor;
  readonly rootLoader: RootLoader;
  readonly schema: GraphQLSchema;
  readonly relaySSRQueryCache: RelaySSRQueryCache;
}) {
  return new Environment({
    network: createNetwork(monitor, rootLoader, schema, relaySSRQueryCache),
    store: new Store(new RecordSource()),
  });
}

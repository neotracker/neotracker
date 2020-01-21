import { RootLoader } from '@neotracker/server-db';
import { GraphQLSchema } from 'graphql';
// @ts-ignore
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import { createQueryDeduplicator } from './createQueryDeduplicator';
import { QueryMap } from './QueryMap';
import { RelaySSRQueryCache } from './RelaySSRQueryCache';

function createNetwork(
  rootLoader: RootLoader,
  schema: GraphQLSchema,
  relaySSRQueryCache: RelaySSRQueryCache,
  queryMap: QueryMap,
): Network {
  const queryDeduplicator = createQueryDeduplicator(schema, queryMap, rootLoader);

  // tslint:disable-next-line no-any
  return Network.create((operation: any, variables: any) => {
    const cachedResult = relaySSRQueryCache.get(operation.id, variables);
    if (cachedResult != undefined) {
      return cachedResult;
    }

    return queryDeduplicator.execute({ id: operation.id, variables }).then((result) => {
      relaySSRQueryCache.add(operation.id, variables, result);

      return result;
    });
  });
}

export function makeRelayEnvironment({
  rootLoader,
  schema,
  relaySSRQueryCache,
  queryMap,
}: {
  readonly rootLoader: RootLoader;
  readonly schema: GraphQLSchema;
  readonly relaySSRQueryCache: RelaySSRQueryCache;
  readonly queryMap: QueryMap;
}) {
  return new Environment({
    network: createNetwork(rootLoader, schema, relaySSRQueryCache, queryMap),
    store: new Store(new RecordSource()),
  });
}

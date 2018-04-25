/* @flow */
import {
  type AppContext,
  type AppOptions,
  observeQuery,
  routes,
} from 'neotracker-shared-web';
import {
  type NetworkType,
  Client,
  LocalKeyStore,
  LocalMemoryStore,
  LocalStringStore,
  LocalUserAccountProvider,
  NEOONEDataProvider,
  NEOONEProvider,
  ReadClient,
} from '@neo-one/client';
import FileSaver from 'file-saver';
import Immutable from 'seamless-immutable';
import type { Monitor } from '@neo-one/monitor';
import type RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';
import type { UserAgent } from 'neotracker-shared-utils';

import { concat, of as _of } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
} from 'rxjs/operators';
import { graphql } from 'react-relay';
import localForage from 'localforage';

import { makeRelayEnvironment } from './relay';

const createAppContextAppOptionsQuery = graphql`
  query createAppContextAppOptionsQuery {
    app_options
  }
`;

export default ({
  network,
  css,
  nonce,
  options,
  monitor,
  userAgent,
  relayResponseCache,
  records,
}: {|
  network: NetworkType,
  css: Array<string>,
  nonce: ?string,
  options: AppOptions,
  monitor: Monitor,
  userAgent: UserAgent,
  relayResponseCache: RelayQueryResponseCache,
  records?: Object,
|}): AppContext => {
  const environment = makeRelayEnvironment({
    endpoint: routes.GRAPHQL,
    monitor,
    relayResponseCache,
    records,
  });

  let prevOptions = options;
  const options$ = concat(
    _of(options),
    observeQuery({
      monitor,
      environment,
      taggedNode: createAppContextAppOptionsQuery,
    }).pipe(
      map(result => {
        prevOptions = Immutable.merge(
          prevOptions,
          JSON.parse(result.app_options),
          { deep: true },
        );
        return prevOptions;
      }),
    ),
  ).pipe(distinctUntilChanged(), publishReplay(1), refCount());

  const provider = new NEOONEProvider({
    options: [{ network, rpcURL: options.rpcURL }],
  });
  const storage = localForage.createInstance({
    name: 'neotracker',
    storeName: 'neotracker',
    version: 1.0,
    description: 'NEO Tracker browser storage',
  });
  const client = new Client({
    memory: new LocalUserAccountProvider({
      keystore: new LocalKeyStore({
        store: new LocalMemoryStore(),
      }),
      provider,
    }),
    localStorage: new LocalUserAccountProvider({
      keystore: new LocalKeyStore({
        store: new LocalStringStore({
          type: 'localStorage',
          storage: {
            setItem: (key: string, value: string) =>
              storage.setItem(key, value),
            getItem: (key: string) => storage.getItem(key),
            removeItem: (key: string) => storage.removeItem(key),
            getAllKeys: () => storage.keys(),
          },
        }),
      }),
      provider,
    }),
  });
  const dataProvider = new NEOONEDataProvider({
    network,
    rpcURL: options.rpcURL,
  });
  const readClient = new ReadClient(dataProvider);
  options$.subscribe({
    next: nextOptions => {
      provider.addNetwork({ network, rpcURL: nextOptions.rpcURL });
      dataProvider.setRPCURL(nextOptions.rpcURL);
    },
  });

  return {
    network,
    environment,
    css,
    nonce,
    options$,
    monitor,
    client,
    readClient,
    userAgent,
    fileSaver: FileSaver,
  };
};

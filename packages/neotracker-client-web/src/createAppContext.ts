import {
  Client,
  LocalKeyStore,
  LocalMemoryStore,
  LocalStringStore,
  LocalUserAccountProvider,
  NEOONEDataProvider,
  NEOONEProvider,
  NetworkType,
  ReadClient,
} from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
// @ts-ignore
import { AppContext, AppOptions, observeQuery, routes } from '@neotracker/shared-web';
import FileSaver from 'file-saver';
import localforage from 'localforage';
// @ts-ignore
import RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';
import { concat, of as _of } from 'rxjs';
import { distinctUntilChanged, map, publishReplay, refCount } from 'rxjs/operators';
import SeamlessImmutable from 'seamless-immutable';
// @ts-ignore
import { createAppContextAppOptionsQuery } from './createAppContextAppOptionsQuery';
import { makeRelayEnvironment } from './relay';

export const createAppContext = ({
  network,
  css,
  nonce,
  options,
  monitor,
  userAgent,
  relayResponseCache,
  records,
}: {
  readonly network: NetworkType;
  readonly css: ReadonlyArray<string>;
  readonly nonce: string | undefined;
  readonly options: AppOptions;
  readonly monitor: Monitor;
  readonly userAgent: IUAParser.IResult;
  readonly relayResponseCache: RelayQueryResponseCache;
  // tslint:disable-next-line no-any
  readonly records?: any;
}): AppContext => {
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
      // tslint:disable-next-line no-any
      map((result: any) => {
        // tslint:disable-next-line no-any
        prevOptions = (SeamlessImmutable as any).merge(prevOptions, JSON.parse(result.app_options), { deep: true });

        return prevOptions;
      }),
    ),
  ).pipe(
    distinctUntilChanged(),
    publishReplay(1),
    refCount(),
  );

  const provider = new NEOONEProvider([{ network, rpcURL: options.rpcURL }]);

  const storage = localforage.createInstance({
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
            setItem: async (key, value) => {
              await storage.setItem(key, value);
            },
            // tslint:disable-next-line no-unnecessary-type-assertion no-useless-cast
            getItem: async (key) => storage.getItem(key) as Promise<string>,
            removeItem: async (key) => {
              await storage.removeItem(key);
            },
            getAllKeys: async () => storage.keys(),
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
    next: (nextOptions) => {
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

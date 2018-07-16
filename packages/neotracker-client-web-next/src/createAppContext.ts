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
import ApolloClient from 'apollo-client';
import FileSaver from 'file-saver';
import gql from 'graphql-tag';
import localforage from 'localforage';
import { AppOptions } from 'neotracker-shared-utils';
import { AppContext, observeQuery } from 'neotracker-shared-web-next';
import { concat, of as _of } from 'rxjs';
import { distinctUntilChanged, filter, map, publishReplay, refCount } from 'rxjs/operators';
import { createAppContextAppOptionsQuery } from './__generated__/createAppContextAppOptionsQuery';

export const createAppContext = ({
  apollo,
  network,
  css,
  nonce,
  options,
  monitor,
  userAgent,
}: {
  // tslint:disable-next-line no-any
  readonly apollo: ApolloClient<any>;
  readonly network: NetworkType;
  readonly css: ReadonlyArray<string>;
  readonly nonce: string | undefined;
  readonly options: AppOptions;
  readonly monitor: Monitor;
  readonly userAgent: IUAParser.IResult;
}): AppContext => {
  const options$ = concat(
    _of(options),
    observeQuery<createAppContextAppOptionsQuery>({
      monitor,
      apollo,
      query: gql`
        query createAppContextAppOptionsQuery {
          app_options
        }
      `,
    }).pipe(
      map(
        (result): AppOptions | undefined =>
          result.type === 'resolved' ? JSON.parse(result.data.app_options) : undefined,
      ),
      filter((value): value is AppOptions => value !== undefined),
    ),
  ).pipe(
    distinctUntilChanged(),
    publishReplay(1),
    refCount(),
  );

  const provider = new NEOONEProvider({
    options: [{ network, rpcURL: options.rpcURL }],
  });

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

  // tslint:disable-next-line no-any
  const mutableWindow: any = window;
  const setApolloClient = (appOptions: AppOptions) => {
    if (appOptions.debug) {
      mutableWindow.__APOLLO_CLIENT__ = apollo;
    } else {
      delete mutableWindow.__APOLLO_CLIENT__;
    }
  };

  setApolloClient(options);

  options$.subscribe({
    next: (nextOptions) => {
      setApolloClient(nextOptions);
      provider.addNetwork({ network, rpcURL: nextOptions.rpcURL });
      dataProvider.setRPCURL(nextOptions.rpcURL);
    },
  });

  return {
    apollo,
    network,
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

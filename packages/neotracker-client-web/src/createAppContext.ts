import { NetworkType } from '@neo-one/client-common';
import {
  Client,
  LocalKeyStore,
  LocalMemoryStore,
  LocalStringStore,
  LocalUserAccountProvider,
  NEOONEProvider,
} from '@neo-one/client-core';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import { AppContext, AppOptions, observeQuery, routes } from '@neotracker/shared-web';
import FileSaver from 'file-saver';
import localforage from 'localforage';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';
import { concat, of as _of } from 'rxjs';
import { distinctUntilChanged, map, publishReplay, refCount } from 'rxjs/operators';
import SeamlessImmutable from 'seamless-immutable';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import { createAppContextAppOptionsQuery } from './createAppContextAppOptionsQuery';
import { makeRelayEnvironment } from './relay';

export const createAppContext = ({
  network,
  css,
  nonce,
  options,
  labels,
  userAgent,
  relayResponseCache,
  records,
}: {
  readonly network: NetworkType;
  readonly css: ReadonlyArray<string>;
  readonly nonce: string | undefined;
  readonly options: AppOptions;
  readonly labels: Record<string, string>;
  readonly userAgent: IUAParser.IResult;
  readonly relayResponseCache: RelayQueryResponseCache;
  // tslint:disable-next-line no-any
  readonly records?: any;
}): AppContext => {
  const environment = makeRelayEnvironment({
    endpoint: routes.GRAPHQL,
    labels,
    relayResponseCache,
    records,
  });

  let prevOptions = options;
  const options$ = concat(
    _of(options),
    observeQuery({
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
      keystore: new LocalKeyStore(new LocalMemoryStore()),
      provider,
    }),
    localStorage: new LocalUserAccountProvider({
      keystore: new LocalKeyStore(
        new LocalStringStore({
          setItem: async (key, value) => {
            await storage.setItem(key, value);
          },
          getItem: async (key) =>
            storage.getItem(key).then((value) => {
              // tslint:disable-next-line:no-any
              const parsed = JSON.parse(value as any);

              return JSON.stringify({
                ...parsed,
                userAccount: parsed.userAccount === undefined ? parsed.account : parsed.userAccount,
              });
              // tslint:disable-next-line no-unnecessary-type-assertion no-useless-cast
            }) as Promise<string>,
          removeItem: async (key) => {
            await storage.removeItem(key);
          },
          getAllKeys: async () => storage.keys(),
        }),
      ),

      provider,
    }),
  });

  options$.subscribe({
    next: (nextOptions) => {
      provider.addNetwork({ network, rpcURL: nextOptions.rpcURL });
    },
  });

  return {
    network,
    environment,
    css,
    nonce,
    options$,
    client,
    userAgent,
    fileSaver: FileSaver,
  };
};

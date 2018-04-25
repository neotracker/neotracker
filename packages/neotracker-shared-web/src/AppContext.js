/* @flow */
import type { AppOptions, UserAgent } from 'neotracker-shared-utils';
import type { Environment } from 'relay-runtime';
import type {
  NetworkType,
  Client,
  LocalKeyStore,
  LocalUserAccountProvider,
  NEOONEProvider,
  ReadClient,
} from '@neo-one/client';
import type { Monitor } from '@neo-one/monitor';
import type { Observable } from 'rxjs';

// eslint-disable-next-line
export type { AppOptions };

export type AppContext = {|
  environment: Environment,
  css: Array<string>,
  nonce: ?string,
  options$: Observable<AppOptions>,
  monitor: Monitor,
  client: Client<{
    localStorage: LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>,
    memory: LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>,
  }>,
  readClient: ReadClient<any>,
  network: NetworkType,
  userAgent: UserAgent,
  fileSaver: {|
    saveAs: (blob: Blob, filename: string) => void,
  |},
|};

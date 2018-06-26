/* @flow */
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

export type AppOptions = $FlowFixMe;

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
  userAgent: $FlowFixMe,
  fileSaver: {|
    saveAs: (blob: Blob, filename: string) => void,
  |},
|};

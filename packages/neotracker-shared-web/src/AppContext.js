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

export type AppOptions = {|
  meta: {|
    title: string,
    name: string,
    description: string,
    walletDescription: string,
    social: {|
      twitter: string,
      fb: string,
    |},
    donateAddress: string,
  |},
  url: string,
  rpcURL: string,
  reportURL?: string,
  reportTimer?: number,
  maintenance: boolean,
  disableWalletModify: boolean,
  confirmLimitMS: number,
  bsaEnabled?: boolean,
|};

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

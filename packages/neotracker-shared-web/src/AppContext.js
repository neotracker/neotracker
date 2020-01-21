/* @flow */
import type { Environment } from 'relay-runtime';
import type { NetworkType } from '@neo-one/client-common';
import type {
  Client,
  LocalKeyStore,
  LocalUserAccountProvider,
  NEOONEProvider,
} from '@neo-one/client-core';
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
  client: Client<{
    localStorage: LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>,
    memory: LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>,
  }>,
  network: NetworkType,
  userAgent: $FlowFixMe,
  fileSaver: {|
    saveAs: (blob: Blob, filename: string) => void,
  |},
|};

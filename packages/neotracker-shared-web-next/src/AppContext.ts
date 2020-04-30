import { NetworkType } from '@neo-one/client-common';
import { Client, LocalKeyStore, LocalUserAccountProvider, NEOProvider } from '@neo-one/client-core';
import { AppOptions } from '@neotracker/shared-utils';
import { ApolloClient } from 'apollo-client';
import { Observable } from 'rxjs';

export interface AppContext {
  // tslint:disable-next-line no-any
  readonly apollo: ApolloClient<any>;
  readonly css: ReadonlyArray<string>;
  readonly nonce: string | undefined;
  readonly options$: Observable<AppOptions>;
  readonly client: Client<
    LocalUserAccountProvider<LocalKeyStore, NEOProvider>,
    {
      readonly localStorage: LocalUserAccountProvider<LocalKeyStore, NEOProvider>;
      readonly memory: LocalUserAccountProvider<LocalKeyStore, NEOProvider>;
    }
  >;
  readonly network: NetworkType;
  readonly userAgent: IUAParser.IResult;
  readonly fileSaver: {
    readonly saveAs: (blob: Blob, filename: string) => void;
  };
}

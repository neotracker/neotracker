import { NetworkType } from '@neo-one/client-common';
import { Client, LocalKeyStore, LocalUserAccountProvider, NEOONEProvider } from '@neo-one/client-core';
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
    LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>,
    {
      readonly localStorage: LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>;
      readonly memory: LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>;
    }
  >;
  readonly network: NetworkType;
  readonly userAgent: IUAParser.IResult;
  readonly fileSaver: {
    readonly saveAs: (blob: Blob, filename: string) => void;
  };
}

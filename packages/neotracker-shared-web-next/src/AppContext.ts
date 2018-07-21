import {
  Client,
  LocalKeyStore,
  LocalUserAccountProvider,
  NEOONEProvider,
  NetworkType,
  ReadClient,
} from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import { AppOptions } from '@neotracker/shared-utils';
import { ApolloClient } from 'apollo-client';
import { Observable } from 'rxjs';

export interface AppContext {
  // tslint:disable-next-line no-any
  readonly apollo: ApolloClient<any>;
  readonly css: ReadonlyArray<string>;
  readonly nonce: string | undefined;
  readonly options$: Observable<AppOptions>;
  readonly monitor: Monitor;
  readonly client: Client<{
    readonly localStorage: LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>;
    readonly memory: LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>;
  }>;
  // tslint:disable-next-line no-any
  readonly readClient: ReadClient<any>;
  readonly network: NetworkType;
  readonly userAgent: IUAParser.IResult;
  readonly fileSaver: {
    readonly saveAs: (blob: Blob, filename: string) => void;
  };
}

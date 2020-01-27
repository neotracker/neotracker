import { Proxy, ProxyProps } from '@neotracker/component-explorer';
import { AppOptions } from '@neotracker/shared-utils';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import fakerStatic from 'faker';
import { addMockFunctionsToSchema, IMocks, makeExecutableSchema } from 'graphql-tools';
import { buildClientSchema, printSchema } from 'graphql/utilities';
import _ from 'lodash';
import * as React from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppContext } from '../../../AppContext';
import { AppContextProvider } from '../../../components';
import { LiveSchemaLink } from './LiveSchemaLink';

// tslint:disable-next-line no-require-imports no-var-requires
const graphql = require('../../../../../neotracker-server-graphql/src/__generated__/schema.graphql.json');

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
const DEFAULT_APP_OPTIONS$: Observable<AppOptions> = new BehaviorSubject({
  meta: {
    title: 'NEO Tracker Blockchain Explorer & Wallet',
    name: 'NEO Tracker',
    description:
      'NEO blockchain explorer and wallet. Explore blocks, transactions, addresses and more. Transfer NEO or GAS, claim GAS and more with the web wallet.',
    walletDescription:
      'NEO Tracker Wallet is a light web wallet that lets NEO holders interact ' +
      'with the NEO blockchain. Transfer NEO, GAS or other tokens, claim GAS, ' +
      'print paper wallets and more.',
    social: {
      fb: 'https://www.facebook.com/neotracker.io/',
      twitter: 'https://twitter.com/neotrackerio',
    },
    donateAddress: 'AKDVzYGLczmykdtRaejgvWeZrvdkVEvQ1X',
  },
  url: `http://127.0.0.1:1400`,
  rpcURL: `http://127.0.0.1:1400/rpc`,
  maintenance: false,
  disableWalletModify: false,
  // 3 minutes
  confirmLimitMS: 3 * 60 * 1000,
  debug: true,
});
const DEFAULT_MOCKS = {
  Int: () => fakerStatic.random.number(),
  Float: () => fakerStatic.random.number(),
  String: () => fakerStatic.random.alphaNumeric(20),
  Boolean: () => fakerStatic.random.boolean(),
  ID: () => fakerStatic.finance.bitcoinAddress(),
};
interface State {
  readonly appContext: AppContext;
  readonly fixtureData: AppContextFixture;
}
interface AppContextFixture {
  readonly apollo?: IMocks;
  readonly options$?: Observable<AppOptions>;
}
export interface AppContextProxyOptions {
  readonly mocks?: IMocks;
}
export const createAppContextProxy = ({ mocks: defaultMocksIn }: AppContextProxyOptions = {}): Proxy => {
  const defaultMocks = _.merge({}, DEFAULT_MOCKS, defaultMocksIn);
  const typeDefs = printSchema(buildClientSchema(graphql.data));
  class AppContextProxy extends React.Component<ProxyProps, State> {
    public static getDerivedStateFromProps(props: ProxyProps, prevState?: State | null): Partial<State> | null {
      const currentFixtureData = prevState == undefined ? {} : prevState.fixtureData;
      const newFixtureData: AppContextFixture = props.data.appContext === undefined ? {} : props.data.appContext;
      if (prevState != undefined && _.isEqual(newFixtureData, currentFixtureData)) {
        // tslint:disable-next-line no-null-keyword
        return null;
      }

      const apollo = _.merge({}, defaultMocks, newFixtureData.apollo === undefined ? {} : newFixtureData.apollo);
      const options$ = newFixtureData.options$ === undefined ? DEFAULT_APP_OPTIONS$ : newFixtureData.options$;

      const schema = makeExecutableSchema({
        typeDefs,
        resolvers: {
          Node: {
            // tslint:disable-next-line no-any
            __resolveType(data: any) {
              return data.typename;
            },
          },
        },
      });
      addMockFunctionsToSchema({ schema, mocks: apollo, preserveResolvers: true });

      const appContext: AppContext = {
        apollo: new ApolloClient({
          cache: new InMemoryCache(),
          link: new LiveSchemaLink({ schema }),
          ssrMode: true,
          queryDeduplication: false,
        }),
        css: [],
        nonce: '1234',
        options$,
        network: 'priv',
        // tslint:disable-next-line no-any
        client: {} as any,
        userAgent: {
          ua: DEFAULT_USER_AGENT,
          browser: {
            name: '',
            version: '',
            major: '',
          },
          device: {
            model: '',
            type: '',
            vendor: '',
          },
          engine: {
            name: '',
            version: '',
          },
          os: {
            name: '',
            version: '',
          },
          cpu: {
            architecture: '',
          },
        },
        fileSaver: {
          saveAs: () => {
            // do nothing
          },
        },
      };

      return {
        appContext,
        fixtureData: {
          apollo,
          options$,
        },
      };
    }

    public readonly state: State;

    public constructor(props: ProxyProps) {
      super(props);
      this.state = AppContextProxy.getDerivedStateFromProps(props) as State;
    }

    public render() {
      const { children, ...rest } = this.props;

      return <AppContextProvider value={this.state.appContext}>{children(rest)}</AppContextProvider>;
    }
  }

  // tslint:disable-next-line no-any
  return AppContextProxy as any;
};

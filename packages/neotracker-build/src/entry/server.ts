// tslint:disable no-import-side-effect no-let ordered-imports
import './init';
import { getOptions, NEOTracker, getConfiguration, defaultNTConfiguration } from '@neotracker/core';
import { BehaviorSubject } from 'rxjs';
import { configuration } from '../configuration';

const {
  port,
  network: neotrackerNetwork,
  nodeRpcUrl,
  metricsPort = 1341,
  db,
  type,
  resetDB,
  apiKeys,
  prod,
} = getConfiguration({
  ...defaultNTConfiguration,
  nodeRpcUrl: undefined,
});

const { googleAnalyticsTag } = apiKeys;

let rpcURL: string | undefined;
switch (neotrackerNetwork) {
  case 'priv':
    rpcURL = nodeRpcUrl;
    if (rpcURL === undefined) {
      rpcURL = 'http://localhost:9040/rpc';
    }
    break;
  case 'main':
    rpcURL = 'https://neotracker.io/rpc';
    break;
  default:
    rpcURL = 'https://testnet.neotracker.io/rpc';
}

const options = getOptions(neotrackerNetwork, {
  port,
  rpcURL,
  db,
  configuration,
  prod,
  googleAnalyticsTag,
});

const options$ = new BehaviorSubject(options);

const environment = {
  server: {
    react: {
      appVersion: 'staging',
    },
    reactApp: {
      appVersion: 'staging',
    },
    db,
    directDB: db,
    server: {
      host: 'localhost',
      port,
    },
    apiKeys,
    network: neotrackerNetwork,
  },
  scrape: {
    network: neotrackerNetwork,
    db,
    pubSub: {},
  },
  start: {
    metricsPort,
    resetDB,
  },
};

const neotracker = new NEOTracker({
  options$,
  environment,
  type,
});
neotracker.start();

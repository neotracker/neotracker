// tslint:disable no-import-side-effect no-let ordered-imports
import './init';
import { getOptions, NEOTracker, getConfiguration } from '@neotracker/core';
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
  coinMarketCapApiKey,
  googleAnalyticsTag,
  clientRpcUrl,
} = getConfiguration();

let externalRpcUrl: string | undefined;
switch (neotrackerNetwork) {
  case 'priv':
    externalRpcUrl = nodeRpcUrl;
    break;
  case 'main':
    externalRpcUrl = 'https://neotracker.io/rpc';
    break;
  default:
    externalRpcUrl = 'https://testnet.neotracker.io/rpc';
}

const { options, network } = getOptions({
  externalRpcUrl,
  port,
  network: neotrackerNetwork,
  rpcURL: clientRpcUrl,
  googleAnalyticsTag,
  db,
  configuration,
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
    network,
    coinMarketCapApiKey,
  },
  scrape: {
    db,
    network,
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

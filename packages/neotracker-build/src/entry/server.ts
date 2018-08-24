// tslint:disable no-import-side-effect no-let ordered-imports
import './init';
import { DefaultMonitor } from '@neo-one/monitor';
import { createConsoleLogger, getOptions, NEOTracker } from '@neotracker/core';
import { BehaviorSubject } from 'rxjs';
import * as path from 'path';
import * as appRootDir from 'app-root-dir';
import { configuration } from '../configuration';
import { NetworkType } from '@neotracker/shared-utils';

const port = process.env.NEOTRACKER_PORT === undefined ? 1340 : parseInt(process.env.NEOTRACKER_PORT, 10);
const dbFileName =
  process.env.NEOTRACKER_DB_FILE === undefined
    ? path.resolve(appRootDir.get(), 'db.sqlite')
    : process.env.NEOTRACKER_DB_FILE;
const network = process.env.NEOTRACKER_NETWORK === undefined ? 'priv' : (process.env.NEOTRACKER_NETWORK as NetworkType);
let rpcURL: string | undefined;
switch (network) {
  case 'priv':
    rpcURL = process.env.NEOTRACKER_RPC_URL;
    if (rpcURL === undefined) {
      rpcURL = 'http://localhost:40200/rpc';
    }
    break;
  case 'main':
    rpcURL = 'https://neotracker.io/rpc';
    break;
  default:
    rpcURL = 'https://testnet.neotracker.io/rpc';
}
const { options } = getOptions({
  network,
  port,
  dbFileName,
  configuration,
  rpcURL,
});
const options$ = new BehaviorSubject(options);
const monitor = DefaultMonitor.create({
  service: 'web_server',
  logger: createConsoleLogger(),
});
const db = {};
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
  },
  scrape: {
    db: {},
    network,
    pubSub: {},
  },
  start: {
    metricsPort: 1341,
  },
};

const neotracker = new NEOTracker({
  options$,
  monitor,
  environment,
});
neotracker.start();

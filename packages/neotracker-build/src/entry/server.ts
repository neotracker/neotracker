// tslint:disable no-import-side-effect no-let ordered-imports
import './init';
import { getOptions, NEOTracker } from '@neotracker/core';
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
const dbHost = process.env.NEOTRACKER_DB_HOST === undefined ? 'localhost' : process.env.NEOTRACKER_DB_HOST;
const dbPort = process.env.NEOTRACKER_DB_PORT === undefined ? 5432 : parseInt(process.env.NEOTRACKER_DB_PORT, 10);
const dbUser = process.env.NEOTRACKER_DB_USER;
const dbPassword = process.env.NEOTRACKER_DB_PASSWORD;
const dbClient = process.env.NEOTRACKER_DB_CLIENT === 'pg' ? 'pg' : 'sqlite3';
const database = process.env.NEOTRACKER_DB === undefined ? 'neotracker_priv' : process.env.NEOTRACKER_DB;
const neotrackerNetwork =
  process.env.NEOTRACKER_NETWORK === undefined ? 'priv' : (process.env.NEOTRACKER_NETWORK as NetworkType);
const resetDB = process.env.NEOTRACKER_RESET_DB === undefined ? false : process.env.NEOTRACKER_RESET_DB === 'true';
const type =
  process.env.NEOTRACKER_TYPE === undefined ? 'all' : (process.env.NEOTRACKER_TYPE as 'all' | 'web' | 'scrape');
let rpcURL: string | undefined;
switch (neotrackerNetwork) {
  case 'priv':
    rpcURL = process.env.NEOTRACKER_RPC_URL;
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
const { options, network } = getOptions({
  network: neotrackerNetwork,
  rpcURL,
  port,
  dbFileName,
  dbUser,
  dbPassword,
  dbClient,
  database,
  configuration,
});
const options$ = new BehaviorSubject(options);
const db = {
  host: dbHost,
  port: dbPort,
};
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
    db,
    network,
    pubSub: {},
  },
  start: {
    metricsPort: 1341,
    resetDB,
  },
};

const neotracker = new NEOTracker({
  options$,
  environment,
  type,
});
neotracker.start();

// tslint:disable no-import-side-effect no-let ordered-imports
import './init';
import { DefaultMonitor } from '@neo-one/monitor';
import { BehaviorSubject } from 'rxjs';
import yargs from 'yargs';
import { getOptions } from '../options';
import * as path from 'path';

import { createConsoleLogger } from '../createConsoleLogger';
import { NEOTracker } from '../NEOTracker';

yargs.describe('network', 'Network configuration to run against.').default('network', 'priv');
yargs.describe('rpc-url', 'NEO•ONE node rpc url.').default('rpc-url', 'http://localhost:40200/rpc');
yargs.describe('next', 'Run NEO Tracker Next').default('next', false);
yargs.describe('db-file', 'DB file').default('db-file', 'db.sqlite');
yargs.describe('port', 'Port to listen on').default('port', 1340);

// tslint:disable-next-line readonly-array
const getPkgPath = (pkg: string, ...paths: string[]) => path.resolve(__dirname, '..', 'dist', pkg, ...paths);

const configuration = {
  clientBundlePath: getPkgPath('neotracker-client-web'),
  clientBundlePathNext: getPkgPath('neotracker-client-web-next'),
  clientPublicPath: '/client/',
  clientPublicPathNext: '/client-next/',
  clientAssetsPath: getPkgPath('neotracker-client-web', 'assets.json'),
  clientAssetsPathNext: getPkgPath('neotracker-client-web-next', 'assets.json'),
  statsPath: getPkgPath('neotracker-client-web-next', 'stats.json'),
};

const port: number = yargs.argv.port;
const { options, network } = getOptions({
  network: yargs.argv.network,
  rpcURL: yargs.argv['rpc-url'],
  port,
  dbFileName: yargs.argv['db-file'],
  configuration,
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
      appVersion: 'dev',
    },
    reactApp: {
      appVersion: 'dev',
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

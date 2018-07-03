// tslint:disable no-import-side-effect no-let
import './init';
// tslint:disable-next-line ordered-imports
import { DefaultMonitor } from '@neo-one/monitor';
import { NEOTracker } from 'neotracker-core';
import { BehaviorSubject } from 'rxjs';
import { getOptions } from '../options';

import { createConsoleLogger } from '../createConsoleLogger';

const port = 1340;
const { options, network } = getOptions({ port });
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

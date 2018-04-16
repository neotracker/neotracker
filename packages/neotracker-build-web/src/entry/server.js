/* @flow */
import '@babel/polyfill';

import { DefaultMonitor } from '@neo-one/monitor';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import createServer$ from 'neotracker-server-web';

import { createConsoleLogger } from 'neotracker-build-utils';
import { finalize } from 'neotracker-shared-utils';

import { getOptions } from '../options';

const port = 1340;
const { options, network } = getOptions({ port });

const monitor = DefaultMonitor.create({
  service: 'web_server',
  logger: createConsoleLogger(),
});

let shutdownInitiated = false;
let subject;
let subscription;
const shutdown = (exitCode: number) => {
  if (!shutdownInitiated) {
    shutdownInitiated = true;
    if (subject != null) {
      subject.complete();
    }
    if (subscription != null) {
      subscription.unsubscribe();
    }
    finalize
      .wait()
      .then(() => {
        monitor.log({ name: 'server_shutdown' });
        monitor.close(() => process.exit(exitCode));
      })
      .catch(error => {
        monitor.logError({ name: 'server_shutdown_error', error });
        monitor.close(() => process.exit(1));
      });
  }
};

process.on('uncaughtException', error => {
  monitor.logError({ name: 'server_uncaught_exception', error });
  shutdown(1);
});

process.on('unhandledRejection', error => {
  monitor.logError({ name: 'server_unhandled_rejection', error });
  shutdown(1);
});

subject = new ReplaySubject(1);
subject.next({ options });
const db = {
  host: 'localhost',
  port: 5432,
};
const server$ = createServer$({
  monitor,
  environment: {
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
  createOptions$: subject,
});
subscription = server$.subscribe();

process.on('SIGINT', () => {
  monitor.log({ name: 'sigint' });
  shutdown(0);
});

process.on('SIGTERM', () => {
  monitor.log({ name: 'sigterm' });
  shutdown(0);
});

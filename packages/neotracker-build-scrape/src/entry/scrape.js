/* @flow */
import '@babel/polyfill';
import { BehaviorSubject } from 'rxjs';
import { DefaultMonitor } from '@neo-one/monitor';

import createScrape$ from 'neotracker-server-scrape';
import { createFromEnvironment, createTables } from 'neotracker-server-db';
import { finalize } from 'neotracker-shared-utils';

import {
  createConsoleLogger,
  db,
  testDatabase,
  mainDatabase,
  privDatabase,
  testRPCURL,
  mainRPCURL,
  getPrivRPCURL,
  getNetworkOptions,
} from 'neotracker-build-utils';

export const MAIN = [
  '4b4f63919b9ecfd2483f0c72ff46ed31b5bbb7a4', //  Phantasma
  'a0b328c01eac8b12b0f8a4fe93645d18fb3f1f0a', //  NKN Token
  '7ac4a2bb052a047506f2f2d3d1528b89cc38e8d4', //  Quarteria
  '78e6d16b914fe15bc16150aeb11d0c2a8e532bdd', //  Switcheo Token
  '23501e5fef0f67ec476406c556e91992323a0357', //  Orbis
  '442e7964f6486005235e87e082f56cd52aa663b8', //  Ontology
  '34579e4614ac1a7bd295372d3de8621770c76cdc', //  Concierge
  '2e25d2127e0240c6deaf35394702feb236d4d7fc', //  Narrative Token
  '6d36b38af912ca107f55a5daedc650054f7e4f75', //  Aphelion
];

export const TEST = [];

export const PRIV = [];

const {
  options: { rpcURL, database, blacklistNEP5Hashes },
  network,
} = getNetworkOptions({
  main: {
    rpcURL: mainRPCURL,
    database: mainDatabase,
    blacklistNEP5Hashes: MAIN,
  },
  test: {
    rpcURL: testRPCURL,
    database: testDatabase,
    blacklistNEP5Hashes: TEST,
  },
  priv: {
    rpcURL: getPrivRPCURL(),
    database: privDatabase,
    blacklistNEP5Hashes: PRIV,
  },
});

const dbOptions = db({ database });

const monitor = DefaultMonitor.create({
  service: 'scrape',
  logger: createConsoleLogger(),
});

const run = async () => {
  let subscription;
  let shutdownInitiated = false;
  const shutdown = (exitCode: number) => {
    if (!shutdownInitiated) {
      shutdownInitiated = true;
      if (subscription != null) {
        subscription.unsubscribe();
      }
      finalize
        .wait()
        .then(() => {
          monitor.log({ name: 'server_shutdown_success' });
          monitor.close(() => {
            process.exit(exitCode);
          });
        })
        .catch(error => {
          monitor.logError({ name: 'server_shutdown_error', error });
          monitor.close(() => {
            process.exit(1);
          });
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

  const knexDB = createFromEnvironment(
    monitor,
    {
      host: 'localhost',
      port: 5432,
    },
    dbOptions,
  );
  await createTables(knexDB, monitor);
  await knexDB.destroy();

  const scrape$ = createScrape$({
    environment: {
      db: {
        host: 'localhost',
        port: 5432,
      },
      network,
    },
    options$: new BehaviorSubject({
      db: dbOptions,
      rootLoader: {
        cacheEnabled: true,
        cacheSize: 100,
      },
      rpcURL,
      migrationEnabled: true,
      blacklistNEP5Hashes,
      repairNEP5BlockFrequency: 10,
      repairNEP5LatencySeconds: 15,
    }),
    monitor,
  });
  subscription = scrape$.subscribe();

  process.on('SIGINT', () => {
    monitor.log({ name: 'server_sigint' });
    shutdown(0);
  });

  process.on('SIGTERM', () => {
    monitor.log({ name: 'server_sigterm' });
    shutdown(0);
  });
};

run();

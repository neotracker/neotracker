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
  '67a5086bac196b67d5fd20745b0dc9db4d2930ed', //  Thor Token
  'af7c7328eee5a275a3bcaee2bf0cf662b5e739be', //  PKC
  '0e86a40588f715fcaf7acd1812d50af478e6e917', //  Orbis
  'ceab719b8baa2310f232ee0d277c061704541cfb', //  Ontology (ONT)
  '891daf0e1750a1031ebe23030828ad7781d874d6', //  Bridge Token
  'a721d5893480260bd28ca1f395f2c465d0b5b1c2', //  Narrative Token
  '34579e4614ac1a7bd295372d3de8621770c76cdc', //  Concierge Token
  '45d493a6f73fa5f404244a5fb8472fc014ca5885', //  CPX
  '132947096727c84c7f9e076c90f08fec3bc17f18', //  THKEY
  'ac116d4b8d4ca55e6b6d4ecce2192039b51cccc5', //  Zeepin Token
  '08e8c4400f1af2c20c28e0018f29535eb85d15b6', //  Trinity Network Credit
  '7f86d61ff377f1b12e589a5907152b57e2ad9a7a', //  ACAT Token
  '2328008e6f6c7bd157a342e789389eb034d9cbc4', //  Redeemable HashPuppy Token
  '0d821bd7b6d53f5c2b40e217c6defc8bbe896cf5', //  Qlink Token
  'b951ecbbc5fe37a9c280a76cb0ce0014827294cf', //  DBC Sale
  'a0777c3ce2b169d4a23bcba4565e3225a0122d95', //  Aphelion
  'ecc6b20d3ccac1ee9ef109af5a7cdb85706b1df9', //  RPX Sale
];

export const TEST = [
  'dbe1ae10018c199a7fb35c5c0c65043e3a67bb28', //  TKY
  '0d44fe9d77c0e578355d9834a2a55677a1fbab34', //  Trinity Network Credit
  'f9572c5b119a6b5775a6af07f1cef5d310038f55', //  Redeemable Testnet Token
  'd3de84c166d93ad2581cb587bda8e02b12dc37ca', //  Redeemable Testnet Token 2
  '400cbed5b41014788d939eaf6286e336e7140f8c', //  Redeemable Testnet Token
  '47f0b6b4ed9022acb18651aec5724c0e3addcda9', //  QLink Token Sales
  'a2df2e12d76bcf4580ca3178d3790b697eece053', //  APX 10.2X
  '0b6c1f919e95fe61c17a7612aebfaf4fda3a2214', //  NEX Ico Template
  'b951ecbbc5fe37a9c280a76cb0ce0014827294cf', //  DBC Sale
  'a0a527e08dbcd51f602a6df20ece7af515d5087b', //  QLC_H_25
  'dcd44e1ee477bc62654d1325ad0d960f58167bdc', //  CGE8 Test
  'cdca68b6eecad1189ff054000c308ecb10db505d', //  Z1 Test Token
  '0fe9513776f43ddaadf0dc211b635719953c469f', //  X2 Token
  'ccc46b6ef854aff01fde3cdf78cf7c78bd4200e0', //  CGE7
];

export const PRIV = [];

const {
  options: { rpcURL, database, nep5Hashes },
  network,
} = getNetworkOptions({
  main: {
    rpcURL: mainRPCURL,
    database: mainDatabase,
    nep5Hashes: MAIN,
  },
  test: {
    rpcURL: testRPCURL,
    database: testDatabase,
    nep5Hashes: TEST,
  },
  priv: {
    rpcURL: getPrivRPCURL(),
    database: privDatabase,
    nep5Hashes: PRIV,
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
      nep5Hashes,
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

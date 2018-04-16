/* @flow */
import { DefaultMonitor } from '@neo-one/monitor';

import {
  db,
  mainDatabase,
  testDatabase,
  privDatabase,
} from 'neotracker-build-utils';
import { createFromEnvironment, createTables } from 'neotracker-server-db';

const network =
  process.env.NEOTRACKER_NETWORK == null
    ? 'priv'
    : process.env.NEOTRACKER_NETWORK;
let database;
switch (network) {
  case 'main':
    database = mainDatabase;
    break;
  case 'test':
    database = testDatabase;
    break;
  case 'priv':
    database = privDatabase;
    break;
  default:
    throw new Error('Unknown network');
}
const dbOptions = db({ database });
const monitor = DefaultMonitor.create({ service: 'create_tables' });

createTables(
  createFromEnvironment(
    monitor,
    {
      host: 'localhost',
      port: 5432,
    },
    dbOptions,
  ),
  monitor,
)
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    // eslint-disable-next-line
    console.error(error);
    process.exit(1);
  });

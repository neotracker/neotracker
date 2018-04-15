/* @flow */
import { DefaultMonitor } from '@neo-one/monitor';

import {
  db,
  log,
  mainDatabase,
  testDatabase,
  privDatabase,
} from 'neotracker-build-utils';
import { createFromEnvironment, dropTable, models } from 'neotracker-server-db';

const title = 'db';

const monitor = DefaultMonitor.create({ service: 'create_tables' });
const dropTables = async (knex: any) => {
  log({
    title,
    level: 'info',
    message: 'Dropping tables...',
  });
  const reversedModels = [...models].reverse();
  for (const model of reversedModels) {
    // eslint-disable-next-line
    await dropTable(knex, monitor, model.modelSchema);
  }
  log({
    title,
    level: 'info',
    message: 'Done dropping tables.',
  });
};

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
dropTables(
  createFromEnvironment(
    monitor,
    {
      host: 'localhost',
      port: 5432,
    },
    dbOptions,
  ),
)
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    // eslint-disable-next-line
    console.error(error);
    process.exit(1);
  });

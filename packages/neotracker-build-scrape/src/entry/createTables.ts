import { DefaultMonitor } from '@neo-one/monitor';
import { db, mainDatabase, privDatabase, testDatabase } from 'neotracker-build-utils';
import { createFromEnvironment, createTables } from 'neotracker-server-db';

const network = process.env.NEOTRACKER_NETWORK === undefined ? 'priv' : process.env.NEOTRACKER_NETWORK;
// tslint:disable-next-line no-let
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
  .catch((error: Error) => {
    // tslint:disable-next-line no-console
    console.error(error);
    process.exit(1);
  });

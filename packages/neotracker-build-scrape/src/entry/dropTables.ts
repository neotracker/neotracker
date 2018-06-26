import { DefaultMonitor } from '@neo-one/monitor';
import { db, log, mainDatabase, privDatabase, testDatabase } from 'neotracker-build-utils';
import { createFromEnvironment, dropTable, models } from 'neotracker-server-db';

const title = 'db';

const monitor = DefaultMonitor.create({ service: 'create_tables' });
// tslint:disable-next-line no-any
const dropTables = async (knex: any) => {
  log({
    title,
    level: 'info',
    message: 'Dropping tables...',
  });

  const mutableReversedModels = [...models];
  mutableReversedModels.reverse();
  // tslint:disable-next-line no-loop-statement
  for (const model of mutableReversedModels) {
    // eslint-disable-next-line
    await dropTable(knex, monitor, model.modelSchema);
  }
  log({
    title,
    level: 'info',
    message: 'Done dropping tables.',
  });
};

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
  .catch((error) => {
    // tslint:disable-next-line no-console
    console.error(error);
    process.exit(1);
  });

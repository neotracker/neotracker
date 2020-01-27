// tslint:disable no-let
import { createChild, serverLogger } from '@neotracker/logger';
import Knex from 'knex';
import { makeAllPowerfulQueryContext } from './lib';

const serverDBLogger = createChild(serverLogger, { component: 'database' });

let checkDBPromise: Promise<boolean> | undefined;
const doCheckDB = async (db: Knex) => {
  try {
    serverDBLogger.info({ title: 'service_check_db' });
    await db.raw('SELECT 1;').queryContext(makeAllPowerfulQueryContext());

    return true;
  } catch (error) {
    serverDBLogger.error({ title: 'service_check_db', error: error.message });

    return false;
  }
};

const checkDB = async (db: Knex) => {
  if (checkDBPromise === undefined) {
    checkDBPromise = doCheckDB(db).then(
      (res) => {
        checkDBPromise = undefined;

        return res;
      },
      () => {
        checkDBPromise = undefined;

        return false;
      },
    );
  }

  return checkDBPromise;
};

const CHECK_TIME_MS = 4000;
let lastCheck: number | undefined;
let healthy: boolean | undefined;
export const isHealthyDB = async (db: Knex): Promise<boolean> => {
  if (lastCheck === undefined || healthy === undefined || Date.now() - lastCheck > CHECK_TIME_MS) {
    healthy = await checkDB(db);
    lastCheck = Date.now();
  }

  return healthy;
};

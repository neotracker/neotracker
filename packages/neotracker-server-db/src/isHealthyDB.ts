// tslint:disable no-let
import { Monitor } from '@neo-one/monitor';
import Knex from 'knex';
import { makeAllPowerfulQueryContext } from './lib';

let checkDBPromise: Promise<boolean> | undefined;
const doCheckDB = async (db: Knex, monitor: Monitor) =>
  monitor
    .captureSpan(
      async () => {
        await db.raw('SELECT 1;').queryContext(makeAllPowerfulQueryContext(monitor));

        return true;
      },
      { name: 'service_check_db', level: 'verbose' },
    )
    .catch(() => false);

const checkDB = async (db: Knex, monitor: Monitor) => {
  if (checkDBPromise === undefined) {
    checkDBPromise = doCheckDB(db, monitor).then(
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
export const isHealthyDB = async (db: Knex, monitor: Monitor): Promise<boolean> => {
  if (lastCheck === undefined || healthy === undefined || Date.now() - lastCheck > CHECK_TIME_MS) {
    healthy = await checkDB(db, monitor);
    lastCheck = Date.now();
  }

  return healthy;
};

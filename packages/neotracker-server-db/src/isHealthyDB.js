/* @flow */
import type { Monitor } from '@neo-one/monitor';

import type knex from 'knex';

import { makeAllPowerfulQueryContext } from './lib';

let checkDBPromise;
const doCheckDB = (db: knex<*>, monitor: Monitor) =>
  monitor
    .captureSpan(
      async () => {
        await db
          .raw('SELECT 1;')
          .queryContext(makeAllPowerfulQueryContext(monitor));
        return true;
      },
      { name: 'service_check_db', level: 'verbose' },
    )
    .catch(() => false);

const checkDB = (db: knex<*>, monitor: Monitor) => {
  if (checkDBPromise == null) {
    checkDBPromise = doCheckDB(db, monitor).then(
      res => {
        checkDBPromise = null;
        return res;
      },
      () => {
        checkDBPromise = null;
        return false;
      },
    );
  }

  return checkDBPromise;
};

const CHECK_TIME_MS = 4000;
let lastCheck;
let healthy;
export default async (db: knex<*>, monitor: Monitor) => {
  if (lastCheck == null || Date.now() - lastCheck > CHECK_TIME_MS) {
    healthy = await checkDB(db, monitor);
    lastCheck = Date.now();
  }

  return healthy;
};

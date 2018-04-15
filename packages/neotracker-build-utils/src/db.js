/* @flow */
export const mainDatabase = 'neotracker_main';
export const testDatabase = 'neotracker_test';
export const privDatabase = 'neotracker_priv';

export default ({ database }: {| database: string |}) => ({
  client: 'pg',
  connection: {
    database,
  },
  pool: {
    min: 8,
    max: 50,
    refreshIdle: true,
    reapInterval: 1000,
    idleTimeoutMillis: 30000,
    log: false,
    returnToHead: true,
  },
  acquireConnectionTimeout: 50000,
});

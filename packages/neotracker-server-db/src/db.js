/* @flow */
import {
  KnownLabel,
  type Labels,
  type Monitor,
  metrics,
} from '@neo-one/monitor';
import { type Observable, interval } from 'rxjs';

import { finalize } from 'neotracker-shared-utils';
import sqlSummary from 'sql-summary';
import { transaction as dbTransaction } from 'objection';

import knex from 'knex';
import { map, scan } from 'rxjs/operators';

export type Environment = {|
  host: string,
  port: number,
|};

export type Options = {|
  client: 'pg',
  connection?: {|
    database?: string,
    user?: string,
    password?: string,
  |},
  pool?: {
    min?: number,
    max?: number,
    refreshIdle?: boolean,
    reapInterval?: number,
    idleTimeoutMillis?: number,
    log?: boolean,
    returnToHead?: boolean,
  },
  acquireConnectionTimeout?: number,
|};

export type AllOptions = {|
  ...Options,
  connection?: {|
    ...Environment,
    ...$PropertyType<Options, 'connection'>,
  |},
|};

const NAMESPACE = 'knex';

const addProfiler = (db: knex<*>, labels: Labels) => {
  db.on('start', builder => {
    const { monitor: monitorIn } =
      builder.queryContext() ||
      ((builder._options || []).find(value => value.queryContext != null) || {})
        .queryContext;
    const monitor = (monitorIn: Monitor).at(NAMESPACE).withLabels(labels);
    const spans = {};
    const stopProfiler = (error, obj) => {
      spans[obj.__knexQueryUid].end(error);
      delete spans[obj.__knexQueryUid];
    };
    builder.on('query', query => {
      spans[query.__knexQueryUid] = monitor
        .withLabels({
          [monitor.labels.DB_STATEMENT_SUMMARY]: sqlSummary(query.sql),
        })
        .withData({
          [monitor.labels.DB_STATEMENT]: query.sql,
        })
        .startSpan({
          name: 'knex_query',
        });
    });
    builder.on('query-error', (error, obj) => stopProfiler(true, obj));
    builder.on('query-response', (response, obj) => stopProfiler(false, obj));
  });
};

const labelNames = [
  KnownLabel.DB_INSTANCE,
  KnownLabel.DB_USER,
  KnownLabel.DB_TYPE,
];
const numUsedGauge = metrics.createGauge({
  name: 'knex_pool_num_used',
  labelNames,
});
const numFreeGauge = metrics.createGauge({
  name: 'knex_pool_num_free',
  labelNames,
});
const numPendingAcquiresGauge = metrics.createGauge({
  name: 'knex_pool_num_pending_acquires',
  labelNames,
});
const numPendingCreatesGauge = metrics.createGauge({
  name: 'knex_pool_num_pending_creates',
  labelNames,
});

export const create = ({
  options,
  monitor: monitorIn,
}: {|
  options: AllOptions,
  monitor: Monitor,
|}): knex<*> => {
  const db = knex((options: $FlowFixMe));
  let destroyed = false;
  const originalDestroy = db.destroy.bind(db);
  const { connection = {} } = options;
  const labels = {
    [monitorIn.labels.DB_INSTANCE]: (connection: $FlowFixMe).database,
    [monitorIn.labels.DB_USER]: (connection: $FlowFixMe).user,
    [monitorIn.labels.DB_TYPE]: 'postgres',
  };
  const subcription = interval(5000)
    .pipe(
      map(() => {
        const { pool } = (db: $FlowFixMe).client;
        numUsedGauge.set(labels, pool.numUsed());
        numFreeGauge.set(labels, pool.numFree());
        numPendingAcquiresGauge.set(labels, pool.numPendingAcquires());
        numPendingCreatesGauge.set(labels, pool.numPendingCreates());
      }),
    )
    .subscribe();
  // $FlowFixMe
  db.destroy = async () => {
    if (!destroyed) {
      destroyed = true;
      subcription.unsubscribe();
      await originalDestroy();
    }
  };
  (db: $FlowFixMe).__labels = labels;
  addProfiler(db, labels);

  return db;
};

const DRAIN_TIMEOUT_MS = 5000;

export const create$ = ({
  monitor,
  options$,
}: {|
  monitor: Monitor,
  options$: Observable<AllOptions>,
|}) => {
  const dispose = async ({ db }: { db: knex<*> }) => {
    try {
      await db.destroy();
    } catch (error) {
      monitor.logError({ name: 'knex_destroy_error', error });
    }
  };

  return options$.pipe(
    scan((prevResultIn?, options) => {
      const prevResult = prevResultIn;
      if (prevResult != null) {
        prevResult.disposeTimeouts.push({
          db: prevResult.db,
          timeout: setTimeout(() => {
            dispose(prevResult.disposeTimeouts.shift());
          }, DRAIN_TIMEOUT_MS),
        });
      }

      const db = create({ monitor, options });
      return prevResult == null
        ? { db, disposeTimeouts: [] }
        : { db, disposeTimeouts: prevResult.disposeTimeouts };
    }, undefined),
    finalize('db', async result => {
      if (result != null) {
        for (const disposeTimeout of result.disposeTimeouts) {
          clearTimeout(disposeTimeout.timeout);
        }
        await Promise.all([
          Promise.all(result.disposeTimeouts.map(dispose)),
          dispose({ db: result.db }),
        ]);
      }
    }),
    map(({ db }) => db),
  );
};

const getOptions = (environment: Environment, options: Options) =>
  ({
    ...options,
    connection: {
      ...(options.connection || {}),
      host: environment.host,
      port: environment.port,
    },
  }: $FlowFixMe);

export const createFromEnvironment = (
  monitor: Monitor,
  environment: Environment,
  options: Options,
) => create({ options: getOptions(environment, options), monitor });

export const createFromEnvironment$ = ({
  monitor,
  environment,
  options$,
}: {|
  monitor: Monitor,
  environment: Environment,
  options$: Observable<Options>,
|}) =>
  create$({
    monitor,
    options$: options$.pipe(map(options => getOptions(environment, options))),
  });

export function transaction<T>(
  db: knex<*>,
  func: (trx: Knex$Transaction<*>) => Promise<T>,
): Promise<T> {
  return dbTransaction(db, async trx => {
    addProfiler(trx, (db: $FlowFixMe).__labels || {});
    const result = await func(trx);
    return result;
  });
}

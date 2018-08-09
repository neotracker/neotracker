import { KnownLabel, Labels, metrics, Monitor, Span } from '@neo-one/monitor';
import { finalize } from '@neotracker/shared-utils';
import Knex from 'knex';
import Objection, { transaction as dbTransaction } from 'objection';
import { interval, Observable } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';
// @ts-ignore
import sqlSummary from 'sql-summary';

export interface DBEnvironment {
  readonly host?: string;
  readonly port?: number;
}
export interface DBOptions {
  readonly client: 'pg' | 'sqlite3';
  readonly connection?: {
    readonly database?: string;
    readonly user?: string;
    readonly password?: string;
  };
  readonly pool?: {
    readonly min?: number;
    readonly max?: number;
    readonly refreshIdle?: boolean;
    readonly reapInterval?: number;
    readonly idleTimeoutMillis?: number;
    readonly log?: boolean;
    readonly returnToHead?: boolean;
  };
  readonly acquireConnectionTimeout?: number;
}

const NAMESPACE = 'Knex';

const addProfiler = (db: Knex, labels: Labels) => {
  // tslint:disable-next-line no-any
  db.on('start', (builder: any) => {
    let queryContext = builder.queryContext();
    if (queryContext == undefined) {
      const value = (builder._options == undefined ? [] : builder._options).find(
        // tslint:disable-next-line no-any
        (val: any) => val.queryContext != undefined,
      );
      queryContext = value.queryContext;
    }
    const { monitor: monitorIn } = queryContext;
    const monitor = (monitorIn as Monitor).at(NAMESPACE).withLabels(labels);
    const mutableSpans: { [key: string]: Span } = {};
    // tslint:disable-next-line no-any
    const stopProfiler = (error: boolean, obj: any) => {
      mutableSpans[obj.__knexQueryUid].end(error);
      // tslint:disable-next-line no-dynamic-delete
      delete mutableSpans[obj.__knexQueryUid];
    };
    // tslint:disable-next-line no-any
    builder.on('query', (query: any) => {
      mutableSpans[query.__knexQueryUid] = monitor
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
    // tslint:disable-next-line no-any
    builder.on('query-error', (_error: Error, obj: any) => stopProfiler(true, obj));
    // tslint:disable-next-line no-any
    builder.on('query-response', (_response: any, obj: any) => stopProfiler(false, obj));
  });
};

const labelNames: ReadonlyArray<string> = [KnownLabel.DB_INSTANCE, KnownLabel.DB_USER, KnownLabel.DB_TYPE];

const numUsedGauge = metrics.createGauge({
  name: 'Knex_pool_num_used',
  labelNames,
});

const numFreeGauge = metrics.createGauge({
  name: 'Knex_pool_num_free',
  labelNames,
});

const numPendingAcquiresGauge = metrics.createGauge({
  name: 'Knex_pool_num_pending_acquires',
  labelNames,
});

const numPendingCreatesGauge = metrics.createGauge({
  name: 'Knex_pool_num_pending_creates',
  labelNames,
});

export const create = ({
  options,
  monitor: monitorIn,
  useNullAsDefault = options.client === 'sqlite3',
}: {
  readonly options: Knex.Config;
  readonly monitor: Monitor;
  readonly useNullAsDefault?: boolean;
}): Knex => {
  const db = Knex({ ...options, useNullAsDefault });
  let destroyed = false;
  const originalDestroy = db.destroy.bind(db);
  const { connection = {} } = options;
  const labels = {
    // tslint:disable-next-line no-any
    [monitorIn.labels.DB_INSTANCE]: (connection as any).database,
    // tslint:disable-next-line no-any
    [monitorIn.labels.DB_USER]: (connection as any).user,
    [monitorIn.labels.DB_TYPE]: 'postgres',
  };

  const subcription = interval(5000)
    .pipe(
      map(() => {
        const { pool } = db.client;
        numUsedGauge.set(labels, pool.numUsed());
        numFreeGauge.set(labels, pool.numFree());
        numPendingAcquiresGauge.set(labels, pool.numPendingAcquires());
        numPendingCreatesGauge.set(labels, pool.numPendingCreates());
      }),
    )
    .subscribe();
  // tslint:disable no-object-mutation
  // @ts-ignore
  db.destroy = async () => {
    if (!destroyed) {
      destroyed = true;
      subcription.unsubscribe();
      await originalDestroy();
    }
  };
  // tslint:disable-next-line no-any
  (db as any).__labels = labels;
  // tslint:enable no-object-mutation
  addProfiler(db, labels);

  return db;
};

const DRAIN_TIMEOUT_MS = 5000;

interface ScanResult {
  readonly db: Knex;
  // tslint:disable-next-line readonly-array
  readonly disposeTimeouts: Array<{ readonly timeout: NodeJS.Timer; readonly db: Knex }>;
}

export const create$ = ({
  monitor,
  options$,
}: {
  readonly monitor: Monitor;
  readonly options$: Observable<Knex.Config>;
}) => {
  const dispose = async ({ db }: { db: Knex | undefined } = { db: undefined }) => {
    if (db === undefined) {
      return;
    }

    try {
      await db.destroy();
    } catch (error) {
      monitor.logError({ name: 'Knex_destroy_error', error });
    }
  };

  return options$.pipe(
    scan<Knex.Config, ScanResult | undefined>((prevResultIn, options) => {
      const prevResult = prevResultIn;
      if (prevResult !== undefined) {
        // tslint:disable-next-line no-array-mutation
        prevResult.disposeTimeouts.push({
          db: prevResult.db,
          timeout: setTimeout(() => {
            // tslint:disable-next-line no-floating-promises no-array-mutation
            dispose(prevResult.disposeTimeouts.shift());
          }, DRAIN_TIMEOUT_MS),
        });
      }

      const db = create({ monitor, options });

      return prevResult === undefined
        ? { db, disposeTimeouts: [] }
        : { db, disposeTimeouts: prevResult.disposeTimeouts };
    }, undefined),
    finalize(async (result) => {
      if (result !== undefined) {
        result.disposeTimeouts.forEach((disposeTimeout) => {
          clearTimeout(disposeTimeout.timeout);
        });
        await Promise.all([Promise.all(result.disposeTimeouts.map(dispose)), dispose({ db: result.db })]);
      }
    }),
    filter((value): value is ScanResult => value !== undefined),
    map(({ db }) => db),
  );
};

const getOptions = (environment: DBEnvironment, options: DBOptions): Knex.Config => ({
  ...options,
  connection: {
    ...(options.connection === undefined ? {} : options.connection),
    host: environment.host,
    port: environment.port,
  },
});

export const createFromEnvironment = (monitor: Monitor, environment: DBEnvironment, options: DBOptions) =>
  create({ options: getOptions(environment, options), monitor });

export const createFromEnvironment$ = ({
  monitor,
  environment,
  options$,
}: {
  readonly monitor: Monitor;
  readonly environment: DBEnvironment;
  readonly options$: Observable<DBOptions>;
}) =>
  create$({
    monitor,
    options$: options$.pipe(map((options) => getOptions(environment, options))),
  });

export async function transaction<T>(db: Knex, func: ((trx: Objection.Transaction) => Promise<T>)): Promise<T> {
  return dbTransaction(db, async (trx) => {
    // tslint:disable-next-line no-any
    const __labels = (db as any).__labels;
    addProfiler(trx, __labels === undefined ? {} : __labels);

    return func(trx);
  });
}

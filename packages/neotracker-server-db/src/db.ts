import { AggregationType, globalStats, MeasureUnit } from '@neo-one/client-switch';
import { Labels, labelsToTags } from '@neo-one/utils';
import { createChild, serverLogger } from '@neotracker/logger';
import { finalize } from '@neotracker/shared-utils';
import Knex from 'knex';
import Objection, { transaction as dbTransaction } from 'objection';
import { interval, Observable } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';
// @ts-ignore
import sqlSummary from 'sql-summary';

export type DBClient = 'pg' | 'sqlite3';

export interface DBOptions {
  readonly client: DBClient;
  readonly connection:
    | string
    | {
        readonly database: string;
        readonly host: string;
        readonly port: number;
        readonly user?: string;
        readonly password?: string;
      }
    | {
        readonly filename: string;
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

const serverDBLogger = createChild(serverLogger, { component: 'database' });

const addProfiler = (db: Knex, labels: Record<string, string>) => {
  // tslint:disable-next-line no-any
  db.on('start', (builder: any) => {
    let queryContext = builder.queryContext();
    if (queryContext == undefined) {
      const value = (builder._options == undefined ? [] : builder._options).find(
        // tslint:disable-next-line no-any
        (val: any) => val.queryContext != undefined,
      );
      // tslint:disable-next-line no-dead-store
      queryContext = value.queryContext;
    }
    // tslint:disable-next-line no-any
    const stopProfiler = (error: boolean, _obj: any) => {
      if (error) {
        serverDBLogger.error({ title: 'knex_query', ...labels });
      }
    };
    // tslint:disable-next-line no-any
    builder.on('query', (query: any) => {
      serverDBLogger.info({
        title: 'knex_query',
        [Labels.DB_STATEMENT_SUMMARY]: sqlSummary(query.sql),
        [Labels.DB_STATEMENT]: query.sql,
        ...labels,
      });
    });
    // tslint:disable-next-line no-any
    builder.on('query-error', (_error: Error, obj: any) => stopProfiler(true, obj));
    // tslint:disable-next-line no-any
    builder.on('query-response', (_response: any, obj: any) => stopProfiler(false, obj));
  });
};

const labelNames: ReadonlyArray<Labels> = [Labels.DB_INSTANCE, Labels.DB_USER, Labels.DB_TYPE];

const createMeasure = (tag: string) => globalStats.createMeasureInt64(`server/${tag}`, MeasureUnit.UNIT);
const numUsed = createMeasure('used');
const numFree = createMeasure('free');
const numPendingAcquires = createMeasure('pending_acquires');
const numPendingCreates = createMeasure('pending_creates');

const numUsedGauge = globalStats.createView(
  'Knex_pool_num_used',
  numUsed,
  AggregationType.COUNT,
  labelsToTags(labelNames),
  'number of Knex pool used',
);
globalStats.registerView(numUsedGauge);

const numFreeGauge = globalStats.createView(
  'Knex_pool_num_free',
  numFree,
  AggregationType.COUNT,
  labelsToTags(labelNames),
  'number of Knex pool free',
);
globalStats.registerView(numFreeGauge);

const numPendingAcquiresGauge = globalStats.createView(
  'Knex_pool_num_pending_acquires',
  numPendingAcquires,
  AggregationType.COUNT,
  labelsToTags(labelNames),
  'number of Knex pending acquires',
);
globalStats.registerView(numPendingAcquiresGauge);

const numPendingCreatesGauge = globalStats.createView(
  'Knex_pool_num_pending_creates',
  numPendingCreates,
  AggregationType.COUNT,
  labelsToTags(labelNames),
  'number of Knex pending creates',
);
globalStats.registerView(numPendingCreatesGauge);

export const create = ({
  options,
  useNullAsDefault = options.client === 'sqlite3',
}: {
  readonly options: Knex.Config;
  readonly useNullAsDefault?: boolean;
}): Knex => {
  const db = Knex({ ...options, useNullAsDefault });
  let destroyed = false;
  const originalDestroy = db.destroy.bind(db);
  const { connection = {} } = options;
  const labels = {
    // tslint:disable-next-line no-any
    [Labels.DB_INSTANCE]: (connection as any).database,
    // tslint:disable-next-line no-any
    [Labels.DB_USER]: (connection as any).user,
    [Labels.DB_TYPE]: 'postgres',
  };
  const subcription = interval(5000)
    .pipe(
      map(() => {
        const { pool } = db.client;
        globalStats.record([
          {
            measure: numUsed,
            value: pool.numUsed(),
          },
          {
            measure: numFree,
            value: pool.numFree(),
          },
          {
            measure: numPendingAcquires,
            value: pool.numPendingAcquires(),
          },
          {
            measure: numPendingCreates,
            value: pool.numPendingCreates(),
          },
        ]);
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

export const create$ = ({ options$ }: { readonly options$: Observable<Knex.Config> }) => {
  const dispose = async ({ db }: { db: Knex | undefined } = { db: undefined }) => {
    if (db === undefined) {
      return;
    }

    try {
      await db.destroy();
    } catch (error) {
      serverDBLogger.error({ title: 'Knex_destroy_error', error });
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
            // tslint:disable-next-line: no-any
          }, DRAIN_TIMEOUT_MS) as any,
        });
      }

      const db = create({ options });

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

export const createFromEnvironment = (options: DBOptions) => create({ options });

export const createFromEnvironment$ = ({ options$ }: { readonly options$: Observable<DBOptions> }) =>
  create$({
    options$,
  });

export async function transaction<T>(db: Knex, func: (trx: Objection.Transaction) => Promise<T>): Promise<T> {
  return dbTransaction(db, async (trx) => {
    // tslint:disable-next-line no-any
    const __labels = (db as any).__labels;
    addProfiler(trx, __labels === undefined ? {} : __labels);

    return func(trx);
  });
}

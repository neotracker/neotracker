import { metrics, Monitor } from '@neo-one/monitor';
import _ from 'lodash';
import { labels } from 'neotracker-shared-utils';
import stringify from 'safe-stable-stringify';
import { ExecutionResult } from './constants';

const GRAPHQL_EXECUTE_QUERIES_DURATION_SECONDS = metrics.createHistogram({
  name: 'graphql_execute_queries_duration_seconds',
});

const GRAPHQL_EXECUTE_QUERIES_FAILURES_TOTAL = metrics.createCounter({
  name: 'graphql_execute_queries_failures_total',
});

interface Query {
  readonly id: string;
  readonly variables: object;
}
interface QueuedQuery {
  readonly cacheKey: string;
  readonly id: string;
  readonly variables: object;
  readonly resolve: ((result: ExecutionResult) => void);
  readonly reject: ((error: Error) => void);
  readonly monitor?: Monitor;
}
type ExecuteQueries = ((queries: ReadonlyArray<Query>, monitor: Monitor) => Promise<ReadonlyArray<ExecutionResult>>);

// tslint:disable-next-line no-let
let resolvedPromise: Promise<void> | undefined;
export class QueryDeduplicator {
  private readonly executeQueries: ExecuteQueries;
  // tslint:disable-next-line:readonly-keyword
  private mutableInflight: { [key: string]: Promise<ExecutionResult> };
  private mutableQueue: QueuedQuery[];
  private readonly monitor: Monitor;

  public constructor(executeQueries: ExecuteQueries, monitor: Monitor) {
    this.executeQueries = executeQueries;
    this.mutableInflight = {};
    this.mutableQueue = [];
    this.monitor = monitor;
  }

  public async execute({
    id,
    variables,
    monitor,
  }: {
    readonly id: string;
    readonly variables: object;
    readonly monitor?: Monitor;
  }): Promise<ExecutionResult> {
    const cacheKey = stringify({ id, variables });
    if ((this.mutableInflight[cacheKey] as Promise<ExecutionResult> | undefined) === undefined) {
      this.mutableInflight[cacheKey] = this.enmutableQueueQuery(cacheKey, id, variables, monitor);
    }

    return this.mutableInflight[cacheKey];
  }

  private async enmutableQueueQuery(
    cacheKey: string,
    id: string,
    variables: object,
    monitor?: Monitor,
  ): Promise<ExecutionResult> {
    if (_.isEmpty(this.mutableInflight)) {
      // tslint:disable-next-line strict-type-predicates
      if (process !== undefined) {
        if (resolvedPromise === undefined) {
          resolvedPromise = Promise.resolve();
        }
        // tslint:disable-next-line no-floating-promises
        resolvedPromise.then(() => process.nextTick(this.consumeQueue));
      } else {
        setTimeout(this.consumeQueue, 0);
      }
    }

    // tslint:disable-next-line promise-must-complete
    return new Promise<ExecutionResult>((resolve, reject) =>
      this.mutableQueue.push({ cacheKey, id, variables, resolve, reject, monitor }),
    );
  }
  private readonly consumeQueue = (): void => {
    const mutableQueue = this.mutableQueue;
    this.mutableQueue = [];
    this.mutableInflight = {};
    if (mutableQueue.length > 0) {
      const { monitor = this.monitor } = mutableQueue[0];
      monitor
        .at('query_deduplicator')
        .withData({
          [labels.QUEUE_SIZE]: mutableQueue.length,
        })
        .captureSpanLog(
          async (span) =>
            this.executeQueries(mutableQueue.map((obj) => ({ id: obj.id, variables: obj.variables })), span),
          {
            name: 'graphql_execute_queries',
            references: mutableQueue.slice(1).map((value) => monitor.childOf(value.monitor)),
            level: { log: 'verbose', span: 'info' },
            metric: {
              total: GRAPHQL_EXECUTE_QUERIES_DURATION_SECONDS,
              error: GRAPHQL_EXECUTE_QUERIES_FAILURES_TOTAL,
            },

            trace: true,
          },
        )
        .then((results) => {
          results.forEach((result, idx) => mutableQueue[idx].resolve(result));
        })
        .catch((error) => {
          mutableQueue.forEach(({ reject }) => reject(error));
        });
    }
  };
}

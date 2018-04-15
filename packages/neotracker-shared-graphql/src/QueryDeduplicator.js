/* @flow */
import { type Monitor, metrics } from '@neo-one/monitor';

import _ from 'lodash';
import { labels } from 'neotracker-shared-utils';
import stringify from 'safe-stable-stringify';

import type { ExecutionResult } from './constants';

const GRAPHQL_EXECUTE_QUERIES_DURATION_SECONDS = metrics.createHistogram({
  name: 'graphql_execute_queries_duration_seconds',
});
const GRAPHQL_EXECUTE_QUERIES_FAILURES_TOTAL = metrics.createCounter({
  name: 'graphql_execute_queries_failures_total',
});

type Query = {| id: string, variables: Object |};
type QueuedQuery = {|
  cacheKey: string,
  id: string,
  variables: Object,
  resolve: (result: ExecutionResult) => void,
  reject: (error: Error) => void,
  monitor?: Monitor,
|};
type ExecuteQueries = (
  queries: Array<Query>,
  monitor: Monitor,
) => Promise<Array<ExecutionResult>>;

let resolvedPromise;
export default class QueryDeduplicator {
  _executeQueries: ExecuteQueries;
  _inflight: { [key: string]: Promise<ExecutionResult> };
  _queue: Array<QueuedQuery>;
  _monitor: Monitor;

  constructor(executeQueries: ExecuteQueries, monitor: Monitor) {
    this._executeQueries = executeQueries;
    this._inflight = {};
    this._queue = [];
    this._monitor = monitor;
  }

  execute({
    id,
    variables,
    monitor,
  }: {|
    id: string,
    variables: Object,
    monitor?: Monitor,
  |}): Promise<ExecutionResult> {
    const cacheKey = stringify({ id, variables });
    if (this._inflight[cacheKey] == null) {
      this._inflight[cacheKey] = this._enqueueQuery(
        cacheKey,
        id,
        variables,
        monitor,
      );
    }

    return this._inflight[cacheKey];
  }

  _enqueueQuery(
    cacheKey: string,
    id: string,
    variables: Object,
    monitor?: Monitor,
  ): Promise<ExecutionResult> {
    if (_.isEmpty(this._inflight)) {
      if (process != null) {
        if (resolvedPromise == null) {
          resolvedPromise = Promise.resolve();
        }
        resolvedPromise.then(() => process.nextTick(this._consumeQueue));
      } else {
        setTimeout(this._consumeQueue, 0);
      }
    }

    return new Promise((resolve, reject) =>
      this._queue.push({ cacheKey, id, variables, resolve, reject, monitor }),
    );
  }

  _consumeQueue = (): void => {
    const queue = this._queue;
    this._queue = [];
    this._inflight = {};
    if (queue.length > 0) {
      const { monitor: monitorIn } = queue[0];
      const monitor = monitorIn || this._monitor;
      monitor
        .at('query_deduplicator')
        .withData({
          [labels.QUEUE_SIZE]: queue.length,
        })
        .captureSpanLog(
          span =>
            this._executeQueries(
              queue.map(obj => ({ id: obj.id, variables: obj.variables })),
              span,
            ),
          {
            name: 'graphql_execute_queries',
            references: queue
              .slice(1)
              .map(value => monitor.childOf(value.monitor)),
            level: { log: 'verbose', span: 'info' },
            metric: {
              total: GRAPHQL_EXECUTE_QUERIES_DURATION_SECONDS,
              error: GRAPHQL_EXECUTE_QUERIES_FAILURES_TOTAL,
            },
            trace: true,
          },
        )
        .then(results => {
          results.forEach((result, idx) => queue[idx].resolve(result));
        })
        .catch(error => {
          queue.forEach(({ reject }) => reject(error));
        });
    }
  };
}

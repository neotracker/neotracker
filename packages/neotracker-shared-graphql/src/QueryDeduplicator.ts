import { createChild, serverLogger } from '@neotracker/logger';
import { labels } from '@neotracker/shared-utils';
import _ from 'lodash';
import stringify from 'safe-stable-stringify';
import { ExecutionResult } from './constants';

const logger = createChild(serverLogger, { component: 'graphql' });

interface Query {
  readonly id: string;
  readonly variables: object;
}
interface QueuedQuery {
  readonly cacheKey: string;
  readonly id: string;
  readonly variables: object;
  readonly resolve: (result: ExecutionResult) => void;
  readonly reject: (error: Error) => void;
}
type ExecuteQueries = (queries: ReadonlyArray<Query>) => Promise<ReadonlyArray<ExecutionResult>>;

// tslint:disable-next-line no-let
let resolvedPromise: Promise<void> | undefined;
export class QueryDeduplicator {
  private readonly executeQueries: ExecuteQueries;
  // tslint:disable-next-line:readonly-keyword
  private mutableInflight: { [key: string]: Promise<ExecutionResult> };
  private mutableQueue: QueuedQuery[];
  private readonly labels: Record<string, string>;

  public constructor(executeQueries: ExecuteQueries, labelsIn: Record<string, string>) {
    this.executeQueries = executeQueries;
    this.mutableInflight = {};
    this.mutableQueue = [];
    this.labels = labelsIn;
  }

  public async execute({
    id,
    variables,
  }: {
    readonly id: string;
    readonly variables: object;
  }): Promise<ExecutionResult> {
    const cacheKey = stringify({ id, variables });
    if ((this.mutableInflight[cacheKey] as Promise<ExecutionResult> | undefined) === undefined) {
      this.mutableInflight[cacheKey] = this.enmutableQueueQuery(cacheKey, id, variables);
    }

    return this.mutableInflight[cacheKey];
  }

  private async enmutableQueueQuery(cacheKey: string, id: string, variables: object): Promise<ExecutionResult> {
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
      this.mutableQueue.push({ cacheKey, id, variables, resolve, reject }),
    );
  }
  private readonly consumeQueue = (): void => {
    const mutableQueue = this.mutableQueue;
    this.mutableQueue = [];
    this.mutableInflight = {};
    if (mutableQueue.length > 0) {
      const logInfo = {
        title: 'graphql_execute_queries',
        [labels.QUEUE_SIZE]: mutableQueue.length,
        ...this.labels,
      };
      logger.info({ ...logInfo });
      this.executeQueries(mutableQueue.map((obj) => ({ id: obj.id, variables: obj.variables })))
        .then((results) => {
          results.forEach((result, idx) => mutableQueue[idx].resolve(result));
        })
        .catch((error) => {
          logger.error({ ...logInfo });
          mutableQueue.forEach(({ reject }) => reject(error));
        });
    }
  };
}

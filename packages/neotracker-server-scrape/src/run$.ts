import { abi, ReadSmartContract } from '@neo-one/client';
import { metrics, Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { AsyncIterableX } from 'ix/asynciterable/asynciterablex';
import { Contract as ContractModel, NEP5_CONTRACT_TYPE, Transaction as TransactionModel } from 'neotracker-server-db';
import { labels } from 'neotracker-shared-utils';
import { concat, merge, Observable, Observer, of as _of } from 'rxjs';
import { concatMap, filter, mergeMap, scan } from 'rxjs/operators';
import { createContractObservable } from './createContractObservable';
import { BlockUpdater, getCurrentHeight, getKnownContractModel, KnownContractUpdater } from './db';
import { ContractActionUpdater } from './db/ContractActionUpdater';
import { normalizeAction, normalizeBlock } from './normalizeBlock';
import { repairNEP5 } from './repairNEP5';
import { Context } from './types';
import { add0x } from './utils';

const NEOTRACKER_PERSIST_BLOCK_DURATION_SECONDS = metrics.createHistogram({
  name: 'neotracker_scrape_persist_block_duration_seconds',
});

const NEOTRACKER_PERSIST_BLOCK_FAILURES_TOTAL = metrics.createCounter({
  name: 'neotracker_scrape_persist_block_failures_total',
});

const NEOTRACKER_SCRAPE_BLOCK_INDEX_GAUGE = metrics.createGauge({
  name: 'neotracker_scrape_block_index',
  help: 'The current block index',
});

const NEOTRACKER_SCRAPE_PERSISTING_BLOCK_INDEX_GAUGE = metrics.createGauge({
  name: 'neotracker_scrape_persisting_block_index',
  help: 'The current in progress persist index',
});

const NEOTRACKER_PERSIST_BLOCK_LATENCY_SECONDS = metrics.createHistogram({
  name: 'neotracker_scrape_persist_block_latency_seconds',
  help: 'The latency from block timestamp to persist',
  buckets: [1, 2, 5, 7.5, 10, 12.5, 15, 17.5, 20],
});

const ADD_CONTRACT_OFFSET = 10;

class ExitError extends Error {}

const getMonitor = (monitor: Monitor) => monitor.at('scrape_run');

interface Signal {
  readonly running: boolean;
}

async function processContractActions(
  signal: Signal,
  context: Context,
  monitor: Monitor,
  contractActionUpdater: ContractActionUpdater,
  knownContractUpdater: KnownContractUpdater,
  contractModel: ContractModel,
  blockIndexStop: number,
  nep5Contract: ReadSmartContract,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const knownContractModel = await getKnownContractModel(context, span, contractModel.id);

      const actions = context.client
        .smartContract({
          hash: add0x(contractModel.id),
          abi: { functions: [] },
        })
        .iterActionsRaw({
          indexStart:
            knownContractModel.processed_block_index === -1
              ? contractModel.block_id
              : knownContractModel.processed_block_index,
          indexStop: blockIndexStop,
          monitor: span,
        });

      try {
        await AsyncIterableX.from(actions).forEach(async (action) => {
          if (!signal.running) {
            throw new ExitError();
          }

          await contractActionUpdater.save(span, { action: normalizeAction(action), nep5Contract });
        });

        await knownContractUpdater.save(span, {
          id: contractModel.id,
          blockIndex: blockIndexStop - 1,
          globalActionIndex: new BigNumber(-1),
        });
      } catch (error) {
        if (error instanceof ExitError) {
          return;
        }

        throw error;
      }
    },
    { name: 'neotracker_scrape_run_process_contract_actions' },
  );
}

export async function initializeNEP5Contract(
  context: Context,
  monitor: Monitor,
  contractModel: ContractModel,
): Promise<ReadSmartContract | undefined> {
  return getMonitor(monitor)
    .withData({
      [labels.CONTRACT_HASH]: contractModel.id,
    })
    .captureSpanLog(
      async (span) => {
        if (contractModel.type === NEP5_CONTRACT_TYPE) {
          try {
            const contractABI = await abi.NEP5({
              client: context.client,
              hash: add0x(contractModel.id),
            });

            const contract = context.client.smartContract({
              hash: add0x(contractModel.id),
              abi: contractABI,
            });

            const [name, symbol, decimals, totalSupply, transactionModel] = await Promise.all([
              contract.name(span),
              contract.symbol(span),
              contract.decimals(span),
              contract.totalSupply(span).catch(() => new BigNumber(0)),
              TransactionModel.query(context.db)
                .context(context.makeQueryContext(span))
                .where('id', contractModel.transaction_id)
                .first()
                .throwIfNotFound(),
            ]);

            await context.asset.save(
              {
                asset: {
                  type: 'NEP5',
                  name,
                  symbol,
                  amount: totalSupply.toString(),
                  precision: decimals.toNumber(),
                },
                hash: contractModel.id,
                transactionID: transactionModel.id,
                transactionHash: transactionModel.hash,
                blockIndex: transactionModel.block_id,
                blockTime: transactionModel.block_time,
              },
              span,
            );

            return contract;
          } catch (error) {
            if (
              error.kind !== 'INVOCATION_CALL' ||
              !error.message.includes('Key contract') ||
              !error.message.includes('not found in database')
            ) {
              throw error;
            }
            getMonitor(monitor)
              .withData({ [labels.CONTRACT_HASH]: contractModel.id })
              .logError({
                name: 'neotracker_scrape_run_initialize_nep5_contract_error',
                error,
              });
          }
        }

        return undefined;
      },
      {
        name: 'neotracker_scrape_run_initialize_nep5_contract',
        error: {},
      },
    );
}

function watchContract$(
  context: Context,
  monitor: Monitor,
  contractActionUpdater: ContractActionUpdater,
  knownContractUpdater: KnownContractUpdater,
  contractModel: ContractModel,
): Observable<void> {
  return Observable.create((observer: Observer<void>) => {
    const signal = { running: true };
    async function _watchContract() {
      await getMonitor(monitor).captureSpan(
        async (span) => {
          const [height, knownContractModel, nep5Contract] = await Promise.all([
            getCurrentHeight(context, span),
            getKnownContractModel(context, span, contractModel.id),
            initializeNEP5Contract(context, span, contractModel),
          ]);

          if (nep5Contract === undefined) {
            return;
          }

          const checkHeight = Math.max(height - ADD_CONTRACT_OFFSET, 1);
          if (knownContractModel.processed_block_index >= checkHeight) {
            // tslint:disable-next-line no-array-mutation
            context.contractModelsToProcess.push([contractModel, nep5Contract]);
          } else {
            await processContractActions(
              signal,
              context,
              span,
              contractActionUpdater,
              knownContractUpdater,
              contractModel,
              height + 1,
              nep5Contract,
            );
            await _watchContract();
          }
        },
        { name: 'neotracker_scrape_run_watch_contract' },
      );
    }

    _watchContract()
      .then(() => observer.complete())
      .catch((error) => observer.error(error));

    return {
      unsubscribe: () => {
        // tslint:disable-next-line no-object-mutation
        signal.running = false;
      },
    };
  });
}

function doRun$({
  catchup,
  context,
  monitor,
  blockUpdater,
  contractActionUpdater,
  knownContractUpdater,
}: {
  readonly catchup: boolean;
  readonly context: Context;
  readonly monitor: Monitor;
  readonly blockUpdater: BlockUpdater;
  readonly contractActionUpdater: ContractActionUpdater;
  readonly knownContractUpdater: KnownContractUpdater;
}): Observable<void> {
  return Observable.create((observer: Observer<void>) => {
    const signal = {
      running: true,
    };

    async function _run() {
      const [height, targetHeight] = await Promise.all([
        getCurrentHeight(context, monitor),
        catchup ? context.client.getBlockCount(monitor) : Promise.resolve(undefined),
      ]);

      const indexStart = height + 1;
      if (targetHeight !== undefined && indexStart > targetHeight) {
        return;
      }

      const blocks = context.client.iterBlocks({
        indexStart,
        indexStop: targetHeight,
        monitor,
      });

      await AsyncIterableX.from(blocks).forEach(async (blockJSON) => {
        if (!signal.running) {
          throw new ExitError();
        }
        const block = normalizeBlock(blockJSON);

        // Catch up for new contracts
        if (context.contractModelsToProcess.length > 0) {
          const { contractModelsToProcess } = context;
          // tslint:disable-next-line no-object-mutation
          context.contractModelsToProcess = [];
          await Promise.all(
            contractModelsToProcess.map(async ([contractModel, nep5Contract]) =>
              processContractActions(
                signal,
                context,
                monitor,
                contractActionUpdater,
                knownContractUpdater,
                contractModel,
                block.index,
                nep5Contract,
              ),
            ),
          );

          contractModelsToProcess.forEach(([contractModel, nep5Contract]) => {
            if (
              contractModel.type === NEP5_CONTRACT_TYPE &&
              (nep5Contract as ReadSmartContract | undefined) !== undefined
            ) {
              // tslint:disable-next-line no-object-mutation
              context.nep5Contracts[contractModel.id] = nep5Contract;
            }
          });
        }

        NEOTRACKER_SCRAPE_PERSISTING_BLOCK_INDEX_GAUGE.set(block.index);
        await monitor.captureSpanLog(async (span) => blockUpdater.save(span, block), {
          name: 'neotracker_persist_block',
          metric: {
            total: NEOTRACKER_PERSIST_BLOCK_DURATION_SECONDS,
            error: NEOTRACKER_PERSIST_BLOCK_FAILURES_TOTAL,
          },
          level: 'debug',
          error: {},
          trace: true,
        });

        NEOTRACKER_SCRAPE_BLOCK_INDEX_GAUGE.set(block.index);
        const latency = monitor.nowSeconds() - block.time;
        NEOTRACKER_PERSIST_BLOCK_LATENCY_SECONDS.observe(latency);

        if (
          !catchup &&
          block.index % context.repairNEP5BlockFrequency === 0 &&
          latency <= context.repairNEP5LatencySeconds
        ) {
          await repairNEP5(context, monitor);
        }
      });
    }

    _run()
      .then(() => observer.complete())
      .catch((error) => {
        if (!(error instanceof ExitError)) {
          observer.error(error);
        }
      });

    return {
      unsubscribe: () => {
        // tslint:disable-next-line no-object-mutation
        signal.running = false;
      },
    };
  });
}

export const run$ = (
  context: Context,
  monitorIn: Monitor,
  blockUpdater: BlockUpdater,
  contractActionUpdater: ContractActionUpdater,
  knownContractUpdater: KnownContractUpdater,
) => {
  const monitor = getMonitor(monitorIn);

  return merge(
    concat(
      doRun$({ context, catchup: true, monitor, blockUpdater, contractActionUpdater, knownContractUpdater }),
      doRun$({ context, catchup: false, monitor, blockUpdater, contractActionUpdater, knownContractUpdater }),
    ),
    createContractObservable(monitor, context.db, context.makeQueryContext, context.blacklistNEP5Hashes$).pipe(
      scan<
        ReadonlyArray<ContractModel>,
        { readonly seenContracts: Set<string>; readonly contractModels: ReadonlyArray<ContractModel> }
      >(
        ({ seenContracts }, contractModels) => {
          const ids = new Set(contractModels.map((contractModel) => contractModel.id));

          Object.keys(context.nep5Contracts).forEach((id) => {
            if (!ids.has(id)) {
              // tslint:disable-next-line no-dynamic-delete no-object-mutation
              delete context.nep5Contracts[id];
              seenContracts.delete(id);
            }
          });

          const outputContractModels = contractModels.filter((contractModel) => !seenContracts.has(contractModel.id));

          outputContractModels.forEach((contractModel) => {
            seenContracts.add(contractModel.id);
          });

          return {
            contractModels: outputContractModels,
            seenContracts,
          };
        },
        {
          seenContracts: new Set(),
          contractModels: [],
        },
      ),
      filter(({ contractModels }) => contractModels.length > 0),
      concatMap(({ contractModels }) => _of(...contractModels)),
      mergeMap((contractModel) =>
        watchContract$(context, monitor, contractActionUpdater, knownContractUpdater, contractModel),
      ),
    ),
  );
};

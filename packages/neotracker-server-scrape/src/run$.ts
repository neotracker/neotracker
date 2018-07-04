import { metrics, Monitor } from '@neo-one/monitor';
import { AsyncIterableX } from 'ix/asynciterable/asynciterablex';
import Knex from 'knex';
import {
  AddressToTransfer as AddressToTransferModel,
  Asset as AssetModel,
  AssetToTransaction as AssetToTransactionModel,
  Coin as CoinModel,
  Contract as ContractModel,
  NEP5_BLACKLIST_CONTRACT_TYPE,
  NEP5_CONTRACT_TYPE,
  QueryContext,
  Transfer as TransferModel,
} from 'neotracker-server-db';
import { concat, defer, Observable, Observer } from 'rxjs';
import { BlockUpdater, getCurrentHeight } from './db';
import { normalizeBlock } from './normalizeBlock';
import { repairNEP5 } from './repairNEP5';
import { Context } from './types';

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

class ExitError extends Error {}

const getMonitor = (monitor: Monitor) => monitor.at('scrape_run');

const deleteNEP5 = async (
  monitor: Monitor,
  db: Knex,
  makeQueryContext: ((monitor: Monitor) => QueryContext),
  contract: ContractModel,
): Promise<void> =>
  monitor.captureSpan(
    async (span) => {
      const asset = await AssetModel.query(db)
        .context(makeQueryContext(span))
        .where('id', contract.id)
        .first();
      if (asset !== undefined) {
        await Promise.all([
          AddressToTransferModel.query(db)
            .context(makeQueryContext(span))
            .delete()
            .from(db.raw('address_to_transfer USING transfer'))
            .where(db.raw('address_to_transfer.id2 = transfer.id'))
            .where('transfer.asset_id', asset.id),
          CoinModel.query(db)
            .context(makeQueryContext(span))
            .delete()
            .where('asset_id', asset.id),
          AssetToTransactionModel.query(db)
            .context(makeQueryContext(span))
            .delete()
            .where('id1', asset.id),
          // Deleting AddressToTransaction is tricky because we probably want to
          // keep the ones where they transferred assets.
        ]);

        await TransferModel.query(db)
          .context(makeQueryContext(span))
          .delete()
          .where('asset_id', asset.id);
        await asset
          .$query(db)
          .context(makeQueryContext(span))
          .delete();
      }

      await contract
        .$query(db)
        .context(makeQueryContext(span))
        .patch({ type: NEP5_BLACKLIST_CONTRACT_TYPE });
    },
    { name: 'neotracker_scrape_contract_delete_nep5' },
  );

const cleanBlacklist = async ({
  context,
  monitor,
}: {
  readonly context: Context;
  readonly monitor: Monitor;
}): Promise<void> => {
  const contractModels = await ContractModel.query(context.db)
    .context(context.makeQueryContext(monitor))
    .where('type', NEP5_CONTRACT_TYPE)
    .whereIn('id', [...context.blacklistNEP5Hashes]);

  await Promise.all(
    contractModels.map(async (contractModel) =>
      deleteNEP5(monitor, context.db, context.makeQueryContext, contractModel),
    ),
  );
};

function doRun$({
  catchup,
  context,
  monitor,
  blockUpdater,
}: {
  readonly catchup: boolean;
  readonly context: Context;
  readonly monitor: Monitor;
  readonly blockUpdater: BlockUpdater;
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

// tslint:disable-next-line export-name
export const run$ = (context: Context, monitorIn: Monitor, blockUpdater: BlockUpdater) => {
  const monitor = getMonitor(monitorIn);

  return concat(
    defer(async () => cleanBlacklist({ context, monitor })),
    doRun$({ context, catchup: true, monitor, blockUpdater }),
    doRun$({ context, catchup: false, monitor, blockUpdater }),
  );
};

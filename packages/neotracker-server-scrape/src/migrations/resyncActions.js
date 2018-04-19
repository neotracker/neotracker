/* @flow */
import {
  NEP5_CONTRACT_TYPE,
  Action as ActionModel,
  AddressToTransaction as AddressToTransactionModel,
  AddressToTransfer as AddressToTransferModel,
  Asset as AssetModel,
  AssetToTransaction as AssetToTransactionModel,
  Block as BlockModel,
  Contract as ContractModel,
  Coin as CoinModel,
  TransactionInputOutput as TransactionInputOutputModel,
  Transaction as TransactionModel,
  Transfer as TransferModel,
  createTables as createTablesBase,
  dropTable,
} from 'neotracker-server-db';
import { AsyncIterableX } from 'ix/asynciterable/asynciterablex';
import {
  type Block,
  type ConfirmedInvocationTransaction,
  type ReadSmartContract,
} from '@neo-one/client';
import type { Monitor } from '@neo-one/monitor';

import { type Context } from '../types';

import { add0x } from '../utils';
import {
  getCurrentHeight,
  getReferences,
  initializeNEP5Contract,
  processInputOutputResultEdgesAndCoins,
  reduceInputOutputResults,
  saveInvocationActions,
} from '../run$';
import normalizeBlock from '../normalizeBlock';

const DROP_TABLES = [ActionModel, AddressToTransferModel, TransferModel];

const getMonitor = (monitor: Monitor) =>
  monitor.at('scrape_migration_resync_actions');

const getNEP5AssetIDs = (
  context: Context,
  monitor: Monitor,
): Promise<Array<string>> =>
  getMonitor(monitor).captureSpan(
    async span =>
      AssetModel.query(context.db)
        .context(context.makeQueryContext(span))
        .where('type', NEP5_CONTRACT_TYPE)
        .then(assets => assets.map(asset => asset.id)),
    { name: 'neotracker_scrape_resync_actions_get_nep5_asset_ids' },
  );

const dropTables = (context: Context, monitor: Monitor) =>
  getMonitor(monitor).captureSpan(
    () =>
      Promise.all(
        DROP_TABLES.map(model =>
          dropTable(context.db, monitor, model.modelSchema),
        ),
      ),
    { name: 'neotracker_scrape_resync_actions_drop_tables' },
  );

const deleteCoins = async (
  context: Context,
  monitor: Monitor,
  assetIDs: Array<string>,
) =>
  getMonitor(monitor).captureSpan(
    async span => {
      if (assetIDs.length > 0) {
        await CoinModel.query(context.db)
          .context(context.makeQueryContext(span))
          .delete()
          .whereIn('asset_id', assetIDs);
      }
    },
    { name: 'neotracker_scrape_resync_actions_delete_coins' },
  );

const deleteAssetToTransactions = async (
  context: Context,
  monitor: Monitor,
  assetIDs: Array<string>,
) =>
  getMonitor(monitor).captureSpan(
    async span => {
      if (assetIDs.length > 0) {
        await AssetToTransactionModel.query(context.db)
          .context(context.makeQueryContext(span))
          .delete()
          .whereIn('id1', assetIDs);
      }
    },
    { name: 'neotracker_scrape_resync_actions_delete_asset_to_transactions' },
  );

const deleteAddressToInvocationTransaction = async (
  context: Context,
  monitor: Monitor,
) =>
  getMonitor(monitor).captureSpan(
    async span => {
      await AddressToTransactionModel.query(context.db)
        .context(context.makeQueryContext(span))
        .delete()
        .from(context.db.raw('address_to_transaction USING transaction'))
        .where(context.db.raw('address_to_transaction.id2 = transaction.id'))
        .where('transaction.type', 'InvocationTransaction');
    },
    {
      name:
        'tracker_scrape_resync_actions_delete_address_to_invocation_transaction',
    },
  );

const deleteAssets = async (
  context: Context,
  monitor: Monitor,
  assetIDs: Array<string>,
) =>
  getMonitor(monitor).captureSpan(
    async span => {
      if (assetIDs.length > 0) {
        await AssetModel.query(context.db)
          .context(context.makeQueryContext(span))
          .delete()
          .whereIn('id', assetIDs);
      }
    },
    { name: 'neotracker_scrape_resync_actions_delete_assets' },
  );

export const insertNEP5Assets = async (context: Context, monitor: Monitor) =>
  getMonitor(monitor).captureSpan(
    async span => {
      const contracts = await ContractModel.query(context.db)
        .context(context.makeQueryContext(span))
        .where('type', NEP5_CONTRACT_TYPE);
      return Promise.all(
        contracts.map(async contractModel => {
          const contract = await initializeNEP5Contract(
            context,
            span,
            contractModel,
          );
          if (contract == null) {
            throw new Error('Something went wrong');
          }
          return [contractModel, contract];
        }),
      );
    },
    { name: 'neotracker_scrape_resync_actions_insert_nep5_assets' },
  );

const createTables = async (context: Context, monitor: Monitor) =>
  getMonitor(monitor).captureSpan(
    async span => createTablesBase(context.db, span),
    { name: 'neotracker_scrape_resync_actions_create_tables' },
  );

const resetAddressTransferCount = async (context: Context, monitor: Monitor) =>
  getMonitor(monitor).captureSpan(
    async span => {
      await context.db
        .raw(
          `
        UPDATE address SET
          transfer_count=0
      `,
        )
        .queryContext(context.makeQueryContext(span));
    },
    { name: 'neotracker_scrape_resync_actions_reset_address_transfer_count' },
  );

const getStartHeight = async (
  context: Context,
  monitor: Monitor,
  checkpointName: string,
) =>
  getMonitor(monitor).captureSpan(
    async span => {
      const checkpointData = await context.migrationHandler.getCheckpoint(
        checkpointName,
        span,
      );
      let { index } = checkpointData == null ? {} : JSON.parse(checkpointData);
      if (index == null) {
        const transactions = await TransactionModel.query(context.db)
          .context(context.makeQueryContext(span))
          .select(context.db.raw('min(??) as ??', ['block_time', 'block_time']))
          .where('type', 'InvocationTransaction');
        const blockTime = transactions[0].block_time;
        const block = await BlockModel.query(context.db)
          .context(context.makeQueryContext(monitor))
          .where('time', blockTime)
          .first();
        ({ index } = block);
      } else {
        index += 1;
      }
      return index;
    },
    { name: 'neotracker_scrape_resync_actions_get_start_height' },
  );

type TransactionData = {|
  transactionModel: TransactionModel,
  references: Array<TransactionInputOutputModel>,
  transaction: ConfirmedInvocationTransaction,
|};
const saveTransaction = async (
  context: Context,
  monitor: Monitor,
  { transaction, transactionModel, references }: TransactionData,
  blockModel: BlockModel,
): Promise<void> =>
  getMonitor(monitor).captureSpan(
    async span => {
      const actionsResult = await saveInvocationActions(
        context,
        span,
        transaction.data.actions,
        transactionModel,
        blockModel,
      );
      const referencesResult = {
        assetIDs: references.map(reference => reference.asset_id),
        addressIDs: references.map(reference => reference.address_id),
      };
      const result = reduceInputOutputResults([
        actionsResult,
        referencesResult,
      ]);

      await processInputOutputResultEdgesAndCoins(
        context,
        span,
        result,
        transactionModel,
      );
    },
    { name: 'neotracker_scrape_resync_actions_save_transaction' },
  );

const processBlock = async (context: Context, monitor: Monitor, block: Block) =>
  getMonitor(monitor).captureSpan(
    async span => {
      const transactionsFiltered = block.transactions.filter(
        transaction => transaction.type === 'InvocationTransaction',
      );
      if (transactionsFiltered.length === 0) {
        return;
      }

      const [blockModel, transactions] = await Promise.all([
        BlockModel.query(context.db)
          .context(context.makeQueryContext(span))
          .where('index', block.index)
          .first(),
        Promise.all(
          transactionsFiltered.map(async transaction => {
            const [transactionModel, references] = await Promise.all([
              TransactionModel.query(context.db)
                .context(context.makeQueryContext(span))
                .where('id', transaction.txid)
                .first(),
              getReferences(context, span, transaction),
            ]);
            if (transactionModel == null) {
              throw new Error('Something went wrong! Transaction was null.');
            }

            if (references.some(ref => ref == null)) {
              throw new Error('Something went wrong! Reference was null.');
            }

            return {
              transactionModel,
              transaction: (transaction: $FlowFixMe),
              references,
            };
          }),
        ),
      ]);
      for (const transactionData of transactions) {
        // eslint-disable-next-line
        await saveTransaction(context, span, transactionData, blockModel);
      }
    },
    { name: 'neotracker_scrape_resync_actions_process_block' },
  );

const fixAddress = async (context: Context, monitor: Monitor) =>
  getMonitor(monitor).captureSpan(
    async span => {
      await context.db
        .raw(
          `
        UPDATE address SET
          last_transaction_id=a.last_transaction_id,
          last_transaction_time=a.last_transaction_time,
          transaction_id=a.transaction_id,
          transaction_count=a.transaction_count
        FROM (
          SELECT DISTINCT ON (a.id)
            a.id,
            FIRST_VALUE(
              a.transaction_id
            ) OVER (
              PARTITION BY a.id
              ORDER BY
                a.block_time DESC,
                a.transaction_index DESC
            ) AS last_transaction_id,
            FIRST_VALUE(
              a.block_time
            ) OVER (
              PARTITION BY a.id
              ORDER BY
                a.block_time DESC,
                a.transaction_index DESC
            ) AS last_transaction_time,
            FIRST_VALUE(
              a.transaction_id
            ) OVER (
              PARTITION BY a.id
              ORDER BY
                a.block_time ASC,
                a.transaction_index ASC
            ) AS transaction_id,
            COUNT(1) OVER (
              PARTITION BY a.id
              ORDER BY
                a.block_time DESC,
                a.transaction_index DESC
            ) AS transaction_count
          FROM (
            SELECT
              a.id,
              t.id AS transaction_id,
              t.block_time,
              t.index AS transaction_index
            FROM address a
            JOIN address_to_transaction att ON
              a.id = att.id1
            JOIN transaction t ON
              att.id2 = t.id
          ) a
        ) a
        WHERE
          address.id = a.id;
      `,
        )
        .queryContext(context.makeQueryContext(span));
      await context.db
        .raw(
          `
          DELETE FROM address
          WHERE id IN (
            SELECT
              id
            FROM address a
            LEFT OUTER JOIN address_to_transaction b ON
              a.id = b.id1
            WHERE b.id1 IS NULL
          )
        `,
        )
        .queryContext(context.makeQueryContext(span));
    },
    { name: 'neotracker_scrape_resync_actions_fix_address' },
  );

const fixAssetAddressCount = async (context: Context, monitor: Monitor) =>
  getMonitor(monitor).captureSpan(
    async span => {
      await context.db
        .raw(
          `
        UPDATE asset SET
          address_count=a.count
        FROM (
          SELECT
            a.id,
            COUNT(1) AS count
          FROM asset a
          JOIN coin b ON
            a.id = b.asset_id
          GROUP BY a.id
        ) a
        WHERE asset.id = a.id
      `,
        )
        .queryContext(context.makeQueryContext(span));
    },
    { name: 'neotracker_scrape_resync_actions_fix_address_count' },
  );

const purge = async (context: Context, monitor: Monitor) =>
  getMonitor(monitor).captureSpan(
    async span => {
      const nep5AssetIDs = await getNEP5AssetIDs(context, span);
      await Promise.all([
        // Delete Transfer, AddressToTransfer
        dropTables(context, span),
        deleteCoins(context, span, nep5AssetIDs),
        deleteAssetToTransactions(context, span, nep5AssetIDs),
        deleteAddressToInvocationTransaction(context, span),
      ]);
      // Make sure to delete after in case it fails.
      await deleteAssets(context, span, nep5AssetIDs);
    },
    { name: 'neotracker_scrape_resync_actions_purge' },
  );

const reset = async (context: Context, monitor: Monitor) =>
  getMonitor(monitor).captureSpan(
    async span => {
      const [nep5Contracts] = await Promise.all([
        insertNEP5Assets(context, span),
        createTables(context, span),
        resetAddressTransferCount(context, span),
      ]);
      return nep5Contracts;
    },
    { name: 'neotracker_scrape_resync_actions_reset' },
  );

const processBlocks = async (
  context: Context,
  monitor: Monitor,
  checkpointName: string,
  checkpoints: Set<string>,
  nep5Contracts: Array<[ContractModel, ReadSmartContract]>,
) =>
  getMonitor(monitor).captureSpan(
    async span => {
      const [indexStart, targetHeight] = await Promise.all([
        getStartHeight(context, span, checkpointName),
        getCurrentHeight(context, span),
      ]);
      const indexStop = targetHeight + 1;
      if (indexStart > indexStop) {
        return;
      }

      const blocks = context.client.iterBlocks({
        indexStart,
        indexStop,
        monitor: span,
      });

      nep5Contracts.forEach(([contractModel, contract]) => {
        // eslint-disable-next-line
        context.nep5Contracts[add0x(contractModel.id)] = contract;
      });

      let count = 0;
      const checkpoint = async (index: number) => {
        count += 1;
        if (count % 1000 === 0) {
          await context.migrationHandler.checkpoint(
            checkpointName,
            JSON.stringify({ checkpoints: [...checkpoints], index }),
            span,
          );
          count = 0;
        }
      };

      await AsyncIterableX.from(blocks).forEach(async blockJSON => {
        const block = normalizeBlock(blockJSON);

        await processBlock(context, span, block);
        await checkpoint(block.index);
      });
    },
    { name: 'neotracker_scrape_resync_actions_process_blocks' },
  );

const fix = async (context: Context, monitor: Monitor) =>
  getMonitor(monitor).captureSpan(
    async span => {
      await Promise.all([
        fixAddress(context, span),
        fixAssetAddressCount(context, span),
      ]);
    },
    { name: 'neotracker_scrape_resync_actions_fix' },
  );

const RESET_NAME = 'reset';

export default async (
  context: Context,
  monitor: Monitor,
  checkpointName: string,
) =>
  getMonitor(monitor).captureSpanLog(
    async span => {
      const data = await context.migrationHandler.getCheckpoint(
        checkpointName,
        span,
      );
      const { checkpoints: checkpointsIn = [] } =
        data == null ? {} : JSON.parse(data);
      const checkpoints = new Set(checkpointsIn);
      let nep5Contracts;
      if (checkpoints.has(RESET_NAME)) {
        // Effectively a no-op, but good to reuse the same code to get the
        // contracts.
        nep5Contracts = await insertNEP5Assets(context, span);
      } else {
        await purge(context, span);
        nep5Contracts = await reset(context, span);
        checkpoints.add(RESET_NAME);
        await context.migrationHandler.checkpoint(
          checkpointName,
          JSON.stringify({ checkpoints: [...checkpoints] }),
          span,
        );
      }
      await processBlocks(
        context,
        span,
        checkpointName,
        checkpoints,
        nep5Contracts,
      );
      await fix(context, span);
    },
    { name: 'neotracker_scrape_resync_actions_main' },
  );

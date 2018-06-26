import {
  abi,
  ActionRaw,
  Block,
  ConfirmedInvocationTransaction,
  ConfirmedTransaction,
  Input,
  Output,
  ReadSmartContract,
  scriptHashToAddress,
} from '@neo-one/client';
import { metrics, Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { AsyncIterableX } from 'ix/asynciterable/asynciterablex';
import _ from 'lodash';
import {
  Action as ActionModel,
  Address as AddressModel,
  AddressToTransaction as AddressToTransactionModel,
  AddressToTransfer as AddressToTransferModel,
  Asset as AssetModel,
  AssetToTransaction as AssetToTransactionModel,
  Block as BlockModel,
  calculateClaimValueBase,
  Coin as CoinModel,
  Contract as ContractModel,
  KnownContract as KnownContractModel,
  NEP5_CONTRACT_TYPE,
  ProcessedIndex,
  SUBTYPE_CLAIM,
  SUBTYPE_ENROLLMENT,
  SUBTYPE_ISSUE,
  SUBTYPE_NONE,
  SUBTYPE_REWARD,
  transaction as dbTransaction,
  Transaction as TransactionModel,
  TransactionInputOutput as TransactionInputOutputModel,
  Transfer as TransferModel,
  TYPE_DUPLICATE_CLAIM,
  TYPE_INPUT,
} from 'neotracker-server-db';
import { GAS_ASSET_HASH, labels, NEO_ASSET_ID, utils } from 'neotracker-shared-utils';
import { concat, merge, Observable, Observer, of as _of } from 'rxjs';
import { concatMap, filter, mergeMap, scan } from 'rxjs/operators';
import { CONFLICT_ERROR_CODE, TUPLESTORE_ERROR_CODE, TUPLESTORE_ERROR_MESSAGE } from './constants';
import { createContractObservable } from './createContractObservable';
import { normalizeAction, normalizeBlock, normalizeHash } from './normalizeBlock';
import { repairNEP5 } from './repairNEP5';
import { Context } from './types';
import { add0x, strip0x } from './utils';

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

const ZERO = new BigNumber('0');
const ADD_CONTRACT_OFFSET = 10;

class ExitError extends Error {}
type CoinChange = [string, string, BigNumber];

const createCoinChange = ({
  addressHash,
  assetHash,
  value,
}: {
  readonly addressHash: string;
  readonly assetHash: string;
  readonly value: BigNumber;
}): [string, string, BigNumber] => [addressHash, assetHash, value];

interface CoinChanges {
  readonly blockModel: BlockModel;
  readonly transactionModel: TransactionModel;
  readonly actionModel?: ActionModel;
  readonly changes: ReadonlyArray<CoinChange>;
}

const reduceCoinChanges = (a?: CoinChanges | undefined, b?: CoinChanges | undefined): CoinChanges | undefined => {
  if (a === undefined) {
    return b;
  }

  if (b === undefined) {
    return a;
  }

  const changes = a.changes.concat(b.changes);
  if (a.blockModel.id > b.blockModel.id) {
    return {
      blockModel: a.blockModel,
      transactionModel: a.transactionModel,
      actionModel: a.actionModel,
      changes,
    };
  }

  if (a.blockModel.id < b.blockModel.id) {
    return {
      blockModel: b.blockModel,
      transactionModel: b.transactionModel,
      actionModel: b.actionModel,
      changes,
    };
  }

  if (a.transactionModel.index > b.transactionModel.index) {
    return {
      blockModel: a.blockModel,
      transactionModel: a.transactionModel,
      actionModel: a.actionModel,
      changes,
    };
  }

  if (a.transactionModel.index < b.transactionModel.index) {
    return {
      blockModel: b.blockModel,
      transactionModel: b.transactionModel,
      actionModel: b.actionModel,
      changes,
    };
  }

  if (a.actionModel === undefined) {
    return {
      blockModel: b.blockModel,
      transactionModel: b.transactionModel,
      actionModel: b.actionModel,
      changes,
    };
  }

  if (b.actionModel === undefined) {
    return {
      blockModel: a.blockModel,
      transactionModel: a.transactionModel,
      actionModel: a.actionModel,
      changes,
    };
  }

  if (a.actionModel.index > b.transactionModel.index) {
    return {
      blockModel: a.blockModel,
      transactionModel: a.transactionModel,
      actionModel: a.actionModel,
      changes,
    };
  }

  if (a.actionModel.index < b.actionModel.index) {
    return {
      blockModel: b.blockModel,
      transactionModel: b.transactionModel,
      actionModel: b.actionModel,
      changes,
    };
  }

  return {
    blockModel: a.blockModel,
    transactionModel: a.transactionModel,
    actionModel: a.actionModel,
    changes,
  };
};
export interface InputOutputResult {
  readonly assetIDs: ReadonlyArray<string>;
  readonly addressIDs: ReadonlyArray<string>;
  readonly coinChanges?: CoinChanges | undefined;
}

export const EMPTY_INPUT_OUTPUT_RESULT = {
  assetIDs: [],
  addressIDs: [],
  coinChanges: undefined,
};

export const reduceInputOutputResults = (results: ReadonlyArray<InputOutputResult>): InputOutputResult =>
  results.reduce(
    (acc, result) => ({
      assetIDs: acc.assetIDs.concat(result.assetIDs),
      addressIDs: acc.addressIDs.concat(result.addressIDs),
      coinChanges: reduceCoinChanges(acc.coinChanges, result.coinChanges),
    }),

    EMPTY_INPUT_OUTPUT_RESULT,
  );

interface CoinSave {
  readonly asset: AssetModel;
  readonly address: AddressModel;
  readonly blockModel: BlockModel;
  readonly transactionModel: TransactionModel;
  readonly actionModel?: ActionModel;
  readonly value: string;
}

interface TransferResult {
  readonly fromAddressModel: AddressModel | undefined;
  readonly toAddressModel: AddressModel | undefined;
  readonly assetModel: AssetModel;
  readonly transferModel: TransferModel;
  readonly coinChanges: CoinChanges;
}

const getMonitor = (monitor: Monitor) => monitor.at('scrape_run');

async function updateProcessedIndex(context: Context, monitor: Monitor, index: number): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      await ProcessedIndex.query(context.db)
        .context(context.makeQueryContext(span))
        .insert({ index })
        .catch((error) => {
          if (error.code !== CONFLICT_ERROR_CODE) {
            throw error;
          }
        });
    },
    { name: 'neotracker_scrape_run_update_processed_index' },
  );
}

async function getKnownContractModel(context: Context, monitor: Monitor, hash: string): Promise<KnownContractModel> {
  return getMonitor(monitor).captureSpan(
    async (span) =>
      KnownContractModel.query(context.db)
        .context(context.makeQueryContext(span))
        .where('id', hash)
        .first()
        .then((result) => {
          if (result === undefined) {
            return KnownContractModel.query(context.db)
              .context(context.makeQueryContext(span))
              .insert({
                id: hash,
                processed_block_index: -1,
                processed_action_global_index: new BigNumber(-1).toString(),
              })
              .returning('*')
              .first()
              .throwIfNotFound()
              .catch(async (error: NodeJS.ErrnoException) => {
                if (error.code === CONFLICT_ERROR_CODE) {
                  return getKnownContractModel(context, span, hash);
                }
                throw error;
              });
          }

          return result;
        }),
    { name: 'neotracker_scrape_run_get_known_contract' },
  );
}

function isActionProcessed(action: ActionRaw, knownContractModel: KnownContractModel): boolean {
  return new BigNumber(knownContractModel.processed_action_global_index).gte(action.globalIndex);
}

async function updateKnownContractModelPostRun(
  context: Context,
  monitor: Monitor,
  action: ActionRaw,
  blockModel: BlockModel,
  contractModel: ContractModel,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) =>
      dbTransaction(context.db, async (trx) => {
        const knownContractModel = await KnownContractModel.query(trx)
          .context(context.makeQueryContext(span))
          .where('id', contractModel.id)
          .forUpdate()
          .first()
          .throwIfNotFound();
        if (!isActionProcessed(action, knownContractModel)) {
          await knownContractModel
            .$query(trx)
            .context(context.makeQueryContext(span))
            .patch({
              processed_block_index: blockModel.id,
              processed_action_global_index: action.globalIndex.toString(),
            });
        }
      }),
    { name: 'neotracker_scrape_run_update_known_contract_model_post_run' },
  );
}

async function updateKnownContractBlockModelPostRun(
  context: Context,
  monitor: Monitor,
  hash: string,
  blockIndex: number,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) =>
      dbTransaction(context.db, async (trx) => {
        const knownContractModel = await KnownContractModel.query(trx)
          .context(context.makeQueryContext(span))
          .where('id', strip0x(hash))
          .forUpdate()
          .first()
          .throwIfNotFound();
        if (blockIndex > knownContractModel.processed_block_index) {
          await knownContractModel
            .$query(trx)
            .context(context.makeQueryContext(span))
            .patch({
              processed_block_index: blockIndex,
              processed_action_global_index: '-1',
            });
        }
      }),
    { name: 'neotracker_scrape_run_update_known_contract_model_post_run' },
  );
}

async function updateKnownContractsBlockModelPostRun(
  context: Context,
  monitor: Monitor,
  blockIndex: number,
): Promise<void> {
  await Promise.all(
    Object.keys(context.nep5Contracts).map(async (hash) =>
      updateKnownContractBlockModelPostRun(context, monitor, hash, blockIndex),
    ),
  );
}

async function checkActionProcessed(
  context: Context,
  monitor: Monitor,
  action: ActionRaw,
  contractModel: ContractModel,
): Promise<boolean> {
  const knownContractModel = await getKnownContractModel(context, monitor, contractModel.id);

  return isActionProcessed(action, knownContractModel);
}

async function onConflictDoNothing(
  context: Context,
  monitor: Monitor,
  tableName: string,
  // tslint:disable-next-line no-any
  values: ReadonlyArray<any>,
): Promise<void> {
  try {
    const query = context.db(tableName).insert(values);
    await context.db.raw(`? ON CONFLICT DO NOTHING`, [query]).queryContext(context.makeQueryContext(monitor));
  } catch (error) {
    if (error.code !== TUPLESTORE_ERROR_CODE || !error.message.includes(TUPLESTORE_ERROR_MESSAGE)) {
      throw error;
    }
    await onConflictDoNothing(context, monitor, tableName, values);
  }
}

async function getReference(context: Context, monitor: Monitor, input: Input): Promise<TransactionInputOutputModel> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const id = TransactionInputOutputModel.makeID({
        type: TYPE_INPUT,
        outputTransactionHash: input.txid,
        outputTransactionIndex: input.vout,
      });

      return TransactionInputOutputModel.query(context.db)
        .context(context.makeQueryContext(span))
        .where('id', id)
        .first()
        .throwIfNotFound();
    },
    { name: 'neotracker_scrape_run_get_reference' },
  );
}

export const getReferences = async (context: Context, monitor: Monitor, transaction: ConfirmedTransaction) =>
  getMonitor(monitor).captureSpan(
    async (span) => Promise.all(transaction.vin.map(async (input) => getReference(context, span, input))),
    { name: 'neotracker_scrape_run_get_references' },
  );

async function getPreviousBlockModel(
  context: Context,
  monitor: Monitor,
  block: Block,
): Promise<BlockModel | undefined> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const prevBlockModel = context.prevBlock;
      if (prevBlockModel !== undefined && prevBlockModel.id + 1 === block.index) {
        return prevBlockModel;
      }

      return BlockModel.query(context.db)
        .context(context.makeQueryContext(span))
        .where('id', block.index - 1)
        .first();
    },
    { name: 'neotracker_scrape_run_get_previous_block_model' },
  );
}

export async function getCurrentHeight(context: Context, monitor: Monitor): Promise<number> {
  return getMonitor(monitor).captureSpan(
    async (span) =>
      ProcessedIndex.query(context.db)
        .context(context.makeQueryContext(span))
        .max('index')
        .first()
        // tslint:disable-next-line no-any
        .then((result) => (result === undefined || (result as any).max == undefined ? -1 : (result as any).max))
        .then(Number),
    { name: 'neotracker_scrape_run_get_current_height' },
  );
}

async function getCurrentHeightBlock(context: Context, monitor: Monitor): Promise<number> {
  if (context.currentHeight !== undefined) {
    return Promise.resolve(context.currentHeight);
  }

  return getCurrentHeight(context, monitor);
}

async function calculateClaimAmount(
  context: Context,
  monitor: Monitor,
  value: BigNumber,
  startHeight: number,
  endHeight: number,
): Promise<string> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      if (value.isEqualTo(ZERO)) {
        return Promise.resolve(ZERO.toFixed(8));
      }

      return calculateClaimValueBase({
        getSystemFee: async (index) => context.systemFee.getThrows(index, span).then((val) => new BigNumber(val)),
        coins: [{ value, startHeight, endHeight }],
      }).then((result) => result.toFixed(8));
    },
    { name: 'neotracker_scrape_run_calculate_claim_amount' },
  );
}

async function saveCoin(context: Context, monitor: Monitor, save: CoinSave): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const { address, asset, value, blockModel, transactionModel, actionModel } = save;
      const replay = await dbTransaction(context.db, async (trx) => {
        const id = CoinModel.makeID({
          addressHash: address.id,
          assetHash: asset.id,
        });

        const coinModel = await CoinModel.query(trx)
          .context(context.makeQueryContext(span))
          .where('id', id)
          .forUpdate()
          .first();
        if (coinModel === undefined) {
          await CoinModel.query(trx)
            .context(context.makeQueryContext(span))
            .insert({
              id,
              address_id: address.id,
              asset_id: asset.id,
              value: new BigNumber('0').toFixed(asset.precision),
              block_id: -1,
              transaction_index: -1,
              action_index: -1,
            })
            .catch((error) => {
              if (error.code !== CONFLICT_ERROR_CODE) {
                throw error;
              }
            });

          return true;
        }

        if (
          blockModel.id > coinModel.block_id ||
          (blockModel.id === coinModel.block_id && transactionModel.index > coinModel.transaction_index) ||
          (blockModel.id === coinModel.block_id &&
            transactionModel.index === coinModel.transaction_index &&
            actionModel !== undefined &&
            actionModel.index > coinModel.action_index)
        ) {
          await coinModel
            .$query(trx)
            .context(context.makeQueryContext(span))
            .patch({
              value: new BigNumber(coinModel.value).plus(value).toFixed(asset.precision),
              block_id: blockModel.id,
              transaction_index: transactionModel.index,
              action_index: actionModel === undefined ? -1 : actionModel.index,
            });
        }

        return false;
      });
      if (replay) {
        await saveCoin(context, span, save);
      }
    },
    { name: 'neotracker_scrape_run_save_coin' },
  );
}

async function saveCoinsForAddress(
  context: Context,
  monitor: Monitor,
  addressHash: string,
  values: { readonly [asset: string]: BigNumber },
  transactionModel: TransactionModel,
  blockModel: BlockModel,
  actionModel?: ActionModel,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      await Promise.all(
        Object.entries(values).map(async ([assetHash, value]) => {
          if (!value.isEqualTo(ZERO)) {
            const [address, asset] = await Promise.all([
              context.address.save({ hash: addressHash, transactionModel }, span),
              context.asset.getThrows(assetHash, span),
            ]);

            await saveCoin(context, span, {
              address,
              asset,
              value: value.toFixed(asset.precision),
              transactionModel,
              blockModel,
              actionModel,
            });
          }
        }),
      );
    },
    { name: 'neotracker_scrape_run_save_coins_for_address' },
  );
}

async function saveCoins(
  context: Context,
  monitor: Monitor,
  { changes, transactionModel, blockModel, actionModel }: CoinChanges,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const groupedValues = Object.entries(
        _.groupBy(
          changes,
          // eslint-disable-next-line
          ([address]) => address,
        ),
      );
      await Promise.all(
        groupedValues.map(async ([address, values]) =>
          saveCoinsForAddress(
            context,
            span,
            address,
            _.mapValues(
              _.groupBy(
                values,
                // tslint:disable-next-line no-unused
                ([_addressHash, assetHash]) => assetHash,
              ),
              (assetValues) =>
                assetValues.reduce<BigNumber>(
                  // tslint:disable-next-line no-unused
                  (acc, [_addressHash, _assetHash, value]) => acc.plus(value),
                  ZERO,
                ),
            ),
            transactionModel,
            blockModel,
            actionModel,
          ),
        ),
      );
    },
    { name: 'neotracker_scrape_run_save_coins_for_address' },
  );
}

export async function processInputOutputResultEdgesAndCoins(
  context: Context,
  monitor: Monitor,
  { assetIDs, addressIDs, coinChanges }: InputOutputResult,
  transactionModel: TransactionModel,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const assetIDsSet = [...new Set(assetIDs)];
      const addressIDsSet = [...new Set(addressIDs)];
      await Promise.all([
        assetIDsSet.length > 0
          ? onConflictDoNothing(
              context,
              span,
              AssetToTransactionModel.tableName,
              assetIDsSet.map((assetID) => ({
                id1: assetID,
                id2: transactionModel.id,
              })),
            )
          : Promise.resolve(),
        addressIDsSet.length > 0
          ? onConflictDoNothing(
              context,
              span,
              AddressToTransactionModel.tableName,
              addressIDsSet.map((addressID) => ({
                id1: addressID,
                id2: transactionModel.id,
              })),
            )
          : Promise.resolve(),
        coinChanges === undefined ? Promise.resolve() : saveCoins(context, span, coinChanges),
      ]);
    },
    {
      name: 'neotracker_scrape_run_process_input_output_result_edges_and_coins',
    },
  );
}

export async function processInputOutputResult(
  context: Context,
  monitor: Monitor,
  result: InputOutputResult,
  transactionModel: TransactionModel,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      await processInputOutputResultEdgesAndCoins(context, span, result, transactionModel);

      const { addressIDs } = result;
      const addressIDsSet = [...new Set(addressIDs)];
      // Avoid dead-lock with AddressToTransaction trigger
      if (addressIDsSet.length > 0) {
        await context.db
          .raw(
            `
          UPDATE address SET
            last_transaction_id=?,
            last_transaction_hash=?,
            last_transaction_time=?
          WHERE
            address.id IN (${addressIDsSet.map((id) => `'${id}'`).join(', ')}) AND (
              address.last_transaction_id IS NULL OR
              address.last_transaction_id <= ${transactionModel.id}
            )
        `,
            [transactionModel.id, transactionModel.hash, transactionModel.block_time],
          )
          .queryContext(context.makeQueryContext(span));
      }
    },
    { name: 'neotracker_scrape_run_process_input_output_result' },
  );
}

async function saveSingleTransfer(
  context: Context,
  monitor: Monitor,
  {
    blockModel,
    transactionModel,
    actionModel,
    fromAddressHash: fromAddressHashIn,
    toAddressHash,
    value,
  }: {
    readonly blockModel: BlockModel;
    readonly transactionModel: TransactionModel;
    readonly actionModel: ActionModel;
    readonly fromAddressHash: string | undefined;
    readonly toAddressHash: string | undefined;
    readonly value: BigNumber;
  },
): Promise<TransferResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      let fromAddressHash = fromAddressHashIn;
      if (scriptHashToAddress(actionModel.script_hash) === fromAddressHash) {
        fromAddressHash = undefined;
      }
      const [fromAddressModel, toAddressModel, assetModel, contractModel] = await Promise.all([
        fromAddressHash === undefined
          ? Promise.resolve(undefined)
          : context.address.save(
              {
                hash: fromAddressHash,
                transactionModel,
              },
              span,
            ),
        toAddressHash === undefined
          ? Promise.resolve(undefined)
          : context.address.save(
              {
                hash: toAddressHash,
                transactionModel,
              },
              span,
            ),
        context.asset.getThrows(actionModel.script_hash, span),
        context.contract.getThrows(actionModel.script_hash, span),
      ]);

      const transferModel = await TransferModel.query(context.db)
        .context(context.makeQueryContext(span))
        .insert({
          id: actionModel.id,
          transaction_id: transactionModel.id,
          transaction_hash: transactionModel.hash,
          asset_id: assetModel.id,
          contract_id: contractModel.id,
          value: value.toFixed(assetModel.precision),
          from_address_id: fromAddressModel === undefined ? undefined : fromAddressModel.id,
          to_address_id: toAddressModel === undefined ? undefined : toAddressModel.id,
          block_id: blockModel.id,
          transaction_index: transactionModel.index,
          action_index: actionModel.index,
          block_time: transactionModel.block_time,
        })
        .returning('*')
        .first()
        .throwIfNotFound()
        .catch((error) => {
          if (error.code === CONFLICT_ERROR_CODE) {
            return TransferModel.query(context.db)
              .context(context.makeQueryContext(span))
              .where('id', actionModel.id)
              .first()
              .throwIfNotFound();
          }

          throw error;
        });

      return {
        fromAddressModel,
        toAddressModel,
        assetModel,
        transferModel,
        coinChanges: {
          blockModel,
          transactionModel,
          actionModel,
          changes: [
            fromAddressModel === undefined
              ? undefined
              : createCoinChange({
                  addressHash: fromAddressModel.id,
                  assetHash: assetModel.id,
                  value: value.negated(),
                }),
            toAddressModel === undefined
              ? undefined
              : createCoinChange({
                  addressHash: toAddressModel.id,
                  assetHash: assetModel.id,
                  value,
                }),
          ].filter(utils.notNull),
        },
      };
    },
    { name: 'neotracker_scrape_run_save_single_transfer' },
  );
}

export async function saveTransfer(
  context: Context,
  monitor: Monitor,
  actionIn: ActionRaw,
  actionModel: ActionModel,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
  contract: ReadSmartContract,
  { errorOnNull }: { readonly errorOnNull?: boolean } = { errorOnNull: false },
): Promise<TransferResult | undefined> {
  // tslint:disable-next-line no-any
  let action: any;
  try {
    action = contract.convertAction(actionIn);
  } catch {
    // ignore errors
  }
  if (action === undefined || action.type !== 'Event' || action.name !== 'transfer') {
    if (errorOnNull) {
      const error = new Error('Could not convert action');
      monitor
        .withData({
          [labels.ACTION_BLOCK_INDEX]: actionIn.blockIndex,
          [labels.ACTION_TRANSACTION_INDEX]: actionIn.transactionIndex,
          [labels.ACTION_INDEX]: actionIn.index.toString(10),
        })
        .logError({
          name: 'neotracker_scrape_run_scrape_convert_action_error',
          error,
        });

      throw error;
    }

    return undefined;
  }

  const parameters = action.parameters;

  return saveSingleTransfer(context, monitor, {
    blockModel,
    transactionModel,
    actionModel,
    fromAddressHash: parameters.from === undefined ? undefined : scriptHashToAddress(parameters.from),
    toAddressHash: parameters.to === undefined ? undefined : scriptHashToAddress(parameters.to),
    value: parameters.amount as BigNumber,
  });
}

async function saveSingleAction(
  context: Context,
  monitor: Monitor,
  {
    transactionModel,
    action: actionIn,
  }: {
    readonly transactionModel: TransactionModel;
    readonly action: ActionRaw;
  },
): Promise<ActionModel> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const action = normalizeAction(actionIn);
      const id = action.globalIndex.toString();

      return ActionModel.query(context.db)
        .context(context.makeQueryContext(span))
        .insert({
          id,
          type: action.type,
          block_id: action.blockIndex,
          transaction_id: transactionModel.id,
          transaction_hash: transactionModel.hash,
          transaction_index: action.transactionIndex,
          index: action.index,
          script_hash: action.scriptHash,
          // tslint:disable-next-line no-any
          message: (action as any).message === undefined ? undefined : encodeURIComponent((action as any).message),
          // tslint:disable-next-line no-any
          args_raw: (action as any).args === undefined ? undefined : JSON.stringify((action as any).args),
        })
        .returning('*')
        .first()
        .throwIfNotFound()
        .catch((error) => {
          if (error.code === CONFLICT_ERROR_CODE) {
            return ActionModel.query(context.db)
              .context(context.makeQueryContext(span))
              .where('id', id)
              .first()
              .throwIfNotFound();
          }
          throw error;
        });
    },
    { name: 'neotracker_scrape_run_save_single_action' },
  );
}

async function saveInvocationAction(
  context: Context,
  monitor: Monitor,
  action: ActionRaw,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
  nep5ContractIn?: ReadSmartContract,
): Promise<TransferResult | undefined> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const actionModel = await saveSingleAction(context, span, {
        transactionModel,
        action,
      });

      let result;
      const nep5Contract = nep5ContractIn || context.nep5Contracts[add0x(action.scriptHash)];
      if (nep5Contract !== undefined) {
        result = await saveTransfer(context, span, action, actionModel, transactionModel, blockModel, nep5Contract);
      }

      return result;
    },
    { name: 'neotracker_scrape_run_save_invocation_action' },
  );
}

export async function processChanges(
  context: Context,
  monitor: Monitor,
  changes: ReadonlyArray<TransferResult>,
): Promise<InputOutputResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const mutableAddressIDs: string[] = [];
      const mutableAssetIDs: string[] = [];
      const mutableAddressToTransfer: { [id: string]: Set<string> } = {};
      let coinChanges: CoinChanges | undefined;
      const addAddress = (addressModel: AddressModel, transferModel: TransferModel) => {
        if ((mutableAddressToTransfer[addressModel.id] as Set<string> | undefined) === undefined) {
          mutableAddressToTransfer[addressModel.id] = new Set();
        }
        mutableAddressToTransfer[addressModel.id].add(transferModel.id);
      };

      changes.forEach(({ fromAddressModel, toAddressModel, assetModel, transferModel, coinChanges: coinChangesIn }) => {
        if (fromAddressModel !== undefined) {
          mutableAddressIDs.push(fromAddressModel.id);
          addAddress(fromAddressModel, transferModel);
        }
        if (toAddressModel !== undefined) {
          mutableAddressIDs.push(toAddressModel.id);
          addAddress(toAddressModel, transferModel);
        }
        mutableAssetIDs.push(assetModel.id);
        coinChanges = reduceCoinChanges(coinChanges, coinChangesIn);
      });

      const addressAndTransfers = Object.entries(mutableAddressToTransfer);
      if (addressAndTransfers.length > 0) {
        await onConflictDoNothing(
          context,
          span,
          AddressToTransferModel.tableName,
          _.flatMap(addressAndTransfers, ([addressID, transferIDsSet]) =>
            [...transferIDsSet].map((transferID) => ({
              id1: addressID,
              id2: transferID,
            })),
          ),
        );
      }

      return { addressIDs: mutableAddressIDs, assetIDs: mutableAssetIDs, coinChanges };
    },
    { name: 'neotracker_scrape_run_process_changes' },
  );
}

export async function saveInvocationActions(
  context: Context,
  monitor: Monitor,
  actions: ReadonlyArray<ActionRaw>,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
  nep5Contract?: ReadSmartContract,
): Promise<InputOutputResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const changes = await Promise.all(
        actions.map(async (action) =>
          saveInvocationAction(context, span, action, transactionModel, blockModel, nep5Contract),
        ),
      );

      return processChanges(context, span, changes.filter(utils.notNull));
    },
    { name: 'neotracker_scrape_run_save_invocation_actions' },
  );
}

async function processActionFiltered(
  context: Context,
  monitor: Monitor,
  action: ActionRaw,
  contractModel: ContractModel,
  nep5Contract?: ReadSmartContract,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const [blockModel, transactionModel] = await Promise.all([
        BlockModel.query(context.db)
          .context(context.makeQueryContext(span))
          .where('id', action.blockIndex)
          .first(),
        TransactionModel.query(context.db)
          .context(context.makeQueryContext(span))
          .where('hash', normalizeHash(action.transactionHash))
          .first(),
      ]);

      if (blockModel === undefined) {
        throw new Error('Expected block for action.');
      }
      if (transactionModel === undefined) {
        throw new Error('Expected transaction for action.');
      }

      const actionsResult = await saveInvocationActions(
        context,
        span,
        [action],
        transactionModel,
        blockModel,
        nep5Contract,
      );

      await processInputOutputResult(context, span, actionsResult, transactionModel);

      await updateKnownContractModelPostRun(context, span, action, blockModel, contractModel);
    },
    { name: 'neotracker_scrape_run_process_action_filtered' },
  );
}

async function processAction(
  context: Context,
  monitor: Monitor,
  action: ActionRaw,
  contractModel: ContractModel,
  nep5Contract?: ReadSmartContract,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const isProcessed = await checkActionProcessed(context, span, action, contractModel);

      if (!isProcessed) {
        await processActionFiltered(context, span, action, contractModel, nep5Contract);
      }
    },
    { name: 'neotracker_scrape_run_process_action' },
  );
}

interface Signal {
  readonly running: boolean;
}

async function processContractActions(
  signal: Signal,
  context: Context,
  monitor: Monitor,
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

          await processAction(context, span, action, contractModel, nep5Contract);
        });

        await updateKnownContractBlockModelPostRun(context, monitor, contractModel.id, blockIndexStop);
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

async function saveInvocationTransaction(
  context: Context,
  monitor: Monitor,
  transaction: ConfirmedInvocationTransaction,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
): Promise<InputOutputResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      // tslint:disable-next-line no-any
      const [result] = await Promise.all<InputOutputResult, any, any>([
        saveInvocationActions(context, span, transaction.invocationData.actions, transactionModel, blockModel),
        transaction.invocationData.asset === undefined
          ? Promise.resolve()
          : context.asset.save(
              {
                transactionModel,
                asset: {
                  type: transaction.invocationData.asset.type,
                  name: transaction.invocationData.asset.name,
                  precision: transaction.invocationData.asset.precision,
                  owner: transaction.invocationData.asset.owner,
                  admin: transaction.invocationData.asset.admin,
                  amount: transaction.invocationData.asset.amount.toString(10),
                },
              },
              span,
            ),
        Promise.all(
          transaction.invocationData.contracts.map(async (contract) =>
            context.contract.save(
              {
                contract,
                blockModel,
                transactionModel,
              },
              span,
            ),
          ),
        ),
      ]);

      return result;
    },
    { name: 'neotracker_scrape_run_save_invocation_transaction' },
  );
}

async function saveClaim(
  context: Context,
  monitor: Monitor,
  claim: Input,
  transactionModel: TransactionModel,
): Promise<InputOutputResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const inputTransactionInputOutput = await getReference(context, span, claim);

      const claimDB = {
        claim_transaction_id: transactionModel.id,
        claim_transaction_hash: transactionModel.hash,
      };

      if (inputTransactionInputOutput.claim_transaction_id === undefined) {
        await inputTransactionInputOutput
          .$query(context.db)
          .context(context.makeQueryContext(span))
          .patch(claimDB)
          .returning('*');
      } else if (inputTransactionInputOutput.claim_transaction_id !== transactionModel.id) {
        // tslint:disable-next-line no-unused no-unnecessary-initializer
        const {
          // @ts-ignore
          id: _del0,
          // @ts-ignore
          created_at: _del1,
          // @ts-ignore
          updated_at: _del2,
          ...copiedProps
        } = {
          ...inputTransactionInputOutput.toJSON(),
        };
        const duplicateClaimDB = {
          ...copiedProps,
          ...claimDB,
          type: TYPE_DUPLICATE_CLAIM,
        };

        await TransactionInputOutputModel.query(context.db)
          .context(context.makeQueryContext(span))
          .insert({
            ...duplicateClaimDB,
            id: TransactionInputOutputModel.makeID({
              // tslint:disable-next-line no-any
              outputTransactionHash: (duplicateClaimDB as any).output_transaction_id,
              // tslint:disable-next-line no-any
              outputTransactionIndex: (duplicateClaimDB as any).output_transaction_index,
              type: duplicateClaimDB.type,
            }),
          })
          .catch((error) => {
            if (error.code !== CONFLICT_ERROR_CODE) {
              throw error;
            }
          });
      }

      return {
        assetIDs: [inputTransactionInputOutput.asset_id],
        addressIDs: [inputTransactionInputOutput.address_id],
      };
    },
    { name: 'neotracker_scrape_run_save_claim' },
  );
}

async function saveClaims(
  context: Context,
  monitor: Monitor,
  claims: ReadonlyArray<Input>,
  transactionModel: TransactionModel,
): Promise<InputOutputResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const results = await Promise.all(claims.map(async (claim) => saveClaim(context, span, claim, transactionModel)));

      return reduceInputOutputResults(results);
    },
    { name: 'neotracker_scrape_run_save_claims' },
  );
}

function getCoinChangesForOutputs(
  references: ReadonlyArray<TransactionInputOutputModel>,
  outputs: ReadonlyArray<Output>,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
): InputOutputResult {
  return {
    addressIDs: [],
    assetIDs: [],
    coinChanges: {
      blockModel,
      transactionModel,
      changes: references
        .map((output) =>
          createCoinChange({
            addressHash: output.address_id,
            assetHash: output.asset_id,
            value: new BigNumber(output.value).negated(),
          }),
        )
        .concat(
          outputs.map((output) =>
            createCoinChange({
              addressHash: output.address,
              assetHash: output.asset,
              value: new BigNumber(output.value),
            }),
          ),
        ),
    },
  };
}

function isIssue(
  output: Output,
  references: ReadonlyArray<TransactionInputOutputModel>,
  transaction: ConfirmedTransaction,
): boolean {
  if (transaction.type !== 'IssueTransaction') {
    return false;
  }

  const mutableValues: { [name: string]: BigNumber } = {};
  references.forEach((input) => {
    if ((mutableValues[input.asset_id] as BigNumber | undefined) === undefined) {
      mutableValues[input.asset_id] = new BigNumber('0');
    }

    mutableValues[input.asset_id] = mutableValues[input.asset_id].plus(new BigNumber(input.value));
  });

  if ((mutableValues[GAS_ASSET_HASH] as BigNumber | undefined) === undefined) {
    mutableValues[GAS_ASSET_HASH] = new BigNumber('0');
  }

  mutableValues[GAS_ASSET_HASH] = mutableValues[GAS_ASSET_HASH].minus(transaction.systemFee).minus(
    transaction.networkFee,
  );

  transaction.vout.forEach((otherOutput) => {
    if ((mutableValues[otherOutput.asset] as BigNumber | undefined) === undefined) {
      mutableValues[otherOutput.asset] = new BigNumber('0');
    }

    mutableValues[otherOutput.asset] = mutableValues[otherOutput.asset].minus(new BigNumber(otherOutput.value));
  });

  const nonZeroValues = _.pickBy(mutableValues, (value) => !value.isEqualTo(ZERO));

  return nonZeroValues[output.asset] !== undefined;
}

function getSubtype(
  output: Output,
  references: ReadonlyArray<TransactionInputOutputModel>,
  transaction: ConfirmedTransaction,
  index: number,
): string {
  if (transaction.type === 'EnrollmentTransaction' && index === 0) {
    return SUBTYPE_ENROLLMENT;
  }

  if (isIssue(output, references, transaction)) {
    return SUBTYPE_ISSUE;
  }

  if (transaction.type === 'ClaimTransaction') {
    return SUBTYPE_CLAIM;
  }

  if (transaction.type === 'MinerTransaction') {
    return SUBTYPE_REWARD;
  }

  return SUBTYPE_NONE;
}

async function getOutput(
  context: Context,
  monitor: Monitor,
  output: Output,
  idx: number,
  references: ReadonlyArray<TransactionInputOutputModel>,
  transaction: ConfirmedTransaction,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
): Promise<{ readonly result: InputOutputResult; readonly output: Partial<TransactionInputOutputModel> }> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const [asset, address] = await Promise.all([
        context.asset.getThrows(output.asset, span),
        context.address.save({ hash: output.address, transactionModel }, span),
      ]);

      return {
        result: { assetIDs: [asset.id], addressIDs: [address.id] },
        output: {
          id: TransactionInputOutputModel.makeID({
            outputTransactionHash: transactionModel.hash,
            outputTransactionIndex: idx,
            type: TYPE_INPUT,
          }),
          type: TYPE_INPUT,
          subtype: getSubtype(output, references, transaction, idx),
          output_transaction_id: transactionModel.id,
          output_transaction_hash: transactionModel.hash,
          output_transaction_index: idx,
          output_block_id: blockModel.id,
          asset_id: asset.id,
          value: output.value.toFixed(asset.precision),
          address_id: address.id,
        },
      };
    },
    { name: 'neotracker_scrape_run_get_output' },
  );
}

async function saveOutputs(
  context: Context,
  monitor: Monitor,
  references: ReadonlyArray<TransactionInputOutputModel>,
  transaction: ConfirmedTransaction,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
): Promise<InputOutputResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const outputs = await Promise.all(
        transaction.vout.map(async (output, idx) =>
          getOutput(context, span, output, idx, references, transaction, transactionModel, blockModel),
        ),
      );

      if (outputs.length > 0) {
        await Promise.all(
          _.chunk(outputs, 1000).map(async (chunk) =>
            TransactionInputOutputModel.query(context.db)
              .context(context.makeQueryContext(span))
              .insert(chunk.map(({ output }) => output))
              .catch((error) => {
                if (error.code !== CONFLICT_ERROR_CODE) {
                  throw error;
                }
              }),
          ),
        );
      }

      return reduceInputOutputResults(outputs.map(({ result }) => result));
    },
    { name: 'neotracker_scrape_run_save_outputs' },
  );
}

async function saveInput(
  context: Context,
  monitor: Monitor,
  reference: TransactionInputOutputModel,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
): Promise<InputOutputResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      let claimValue = '0';
      if (reference.asset_id === `${NEO_ASSET_ID}`) {
        claimValue = await calculateClaimAmount(
          context,
          span,
          new BigNumber(reference.value),
          reference.output_block_id,
          blockModel.id,
        );
      }
      await reference
        .$query(context.db)
        .context(context.makeQueryContext(span))
        .patch({
          input_transaction_id: transactionModel.id,
          claim_value: claimValue,
        })
        .returning('*');

      return {
        assetIDs: [reference.asset_id],
        addressIDs: [reference.address_id],
      };
    },
    { name: 'neotracker_scrape_run_save_input' },
  );
}

async function saveInputs(
  context: Context,
  monitor: Monitor,
  references: ReadonlyArray<TransactionInputOutputModel>,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
): Promise<InputOutputResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const results = await Promise.all(
        references.map(async (reference) => saveInput(context, span, reference, transactionModel, blockModel)),
      );

      return reduceInputOutputResults(results);
    },
    { name: 'neotracker_scrape_run_save_inputs' },
  );
}

async function saveInputOutputs(
  context: Context,
  monitor: Monitor,
  transaction: ConfirmedTransaction,
  references: ReadonlyArray<TransactionInputOutputModel>,
  transactionModel: TransactionModel,
  blockModel: BlockModel,
): Promise<InputOutputResult> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const coinsResult = getCoinChangesForOutputs(references, transaction.vout, transactionModel, blockModel);

      const [inputsResult, outputsResult, claimsResult, invocationResult] = await Promise.all<
        InputOutputResult,
        InputOutputResult,
        InputOutputResult,
        InputOutputResult,
        // tslint:disable-next-line no-any
        any,
        // tslint:disable-next-line no-any
        any
      >([
        saveInputs(context, span, references, transactionModel, blockModel),
        saveOutputs(context, span, references, transaction, transactionModel, blockModel),
        transaction.type === 'ClaimTransaction'
          ? saveClaims(context, span, transaction.claims, transactionModel)
          : Promise.resolve({ addressIDs: [], assetIDs: [] }),
        transaction.type === 'InvocationTransaction'
          ? saveInvocationTransaction(context, span, transaction, transactionModel, blockModel)
          : Promise.resolve({ addressIDs: [], assetIDs: [] }),
        transaction.type === 'RegisterTransaction'
          ? context.asset.save(
              {
                transactionModel,
                asset: {
                  type: transaction.asset.type,
                  name: transaction.asset.name,
                  precision: transaction.asset.precision,
                  owner: transaction.asset.owner,
                  admin: transaction.asset.admin,
                  amount: transaction.asset.amount.toString(10),
                },
              },

              span,
            )
          : Promise.resolve(),
        transaction.type === 'PublishTransaction'
          ? context.contract.save(
              {
                contract: transaction.contract,
                blockModel,
                transactionModel,
              },
              span,
            )
          : Promise.resolve(),
      ]);

      return reduceInputOutputResults([inputsResult, outputsResult, claimsResult, invocationResult, coinsResult]);
    },
    { name: 'neotracker_scrape_run_save_input_outputs' },
  );
}

async function saveTransaction(
  context: Context,
  monitor: Monitor,
  transaction: ConfirmedTransaction,
  blockModel: BlockModel,
  index: number,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const [transactionModel, references] = await Promise.all([
        TransactionModel.query(context.db)
          .context(context.makeQueryContext(span))
          .insert({
            id: transaction.data.globalIndex.toString(),
            hash: transaction.txid,
            type: transaction.type,
            size: transaction.size,
            version: transaction.version,
            attributes_raw: JSON.stringify(transaction.attributes),
            system_fee: transaction.systemFee.toFixed(8),
            network_fee: transaction.networkFee.toFixed(8),
            // tslint:disable-next-line no-any
            nonce: (transaction as any).nonce === undefined ? undefined : `${(transaction as any).nonce}`,
            // tslint:disable-next-line no-any
            pubkey: (transaction as any).publicKey === undefined ? undefined : (transaction as any).publicKey,
            block_id: blockModel.id,
            block_time: blockModel.time,
            index,
            scripts_raw: JSON.stringify(
              transaction.scripts.map((script) => ({
                invocation_script: script.invocation,
                verification_script: script.verification,
              })),
            ),
            // tslint:disable-next-line no-any
            script: (transaction as any).script === undefined ? undefined : (transaction as any).script,
            // tslint:disable-next-line no-any
            gas: (transaction as any).gas === undefined ? undefined : (transaction as any).gas.toFixed(8),
            result_raw:
              // tslint:disable-next-line no-any
              (transaction as any).invocationData === undefined ||
              // tslint:disable-next-line no-any
              (transaction as any).invocationData.result === undefined
                ? undefined
                : // tslint:disable-next-line no-any
                  JSON.stringify((transaction as any).invocationData.result),
          })
          .first()
          .returning('*')
          .throwIfNotFound()
          .catch((error) => {
            if (error.code === CONFLICT_ERROR_CODE) {
              return TransactionModel.query(context.db)
                .context(context.makeQueryContext(span))
                .where('id', transaction.data.globalIndex.toString())
                .first()
                .throwIfNotFound();
            }

            throw error;
          }),
        getReferences(context, span, transaction),
      ]);

      const result = await saveInputOutputs(context, span, transaction, references, transactionModel, blockModel);

      await processInputOutputResult(context, span, result, transactionModel);
    },
    { name: 'neotracker_scrape_run_save_transaction' },
  );
}

async function saveTransactions(
  context: Context,
  monitor: Monitor,
  block: Block,
  blockModel: BlockModel,
): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      // tslint:disable-next-line no-loop-statement
      for (const [index, transaction] of block.transactions.entries()) {
        await saveTransaction(context, span, transaction, blockModel, index);
      }
    },
    { name: 'neotracker_scrape_run_save_transactions' },
  );
}

async function saveBlock(
  context: Context,
  monitor: Monitor,
  block: Block,
  systemFee: BigNumber,
  aggregatedSystemFee: BigNumber,
  prevBlockModel?: BlockModel | undefined,
): Promise<BlockModel> {
  return monitor.captureSpan(
    async (span) => {
      const address = await context.address.save({ hash: block.nextConsensus }, span);
      let prevBlockData = {};
      if (prevBlockModel !== undefined) {
        prevBlockData = {
          previous_block_id: prevBlockModel.id,
          previous_block_hash: prevBlockModel.hash,
          validator_address_id: prevBlockModel.next_validator_address_id,
        };
      }

      const [blockModel] = await Promise.all([
        BlockModel.query(context.db)
          .context(context.makeQueryContext(span))
          .insert({
            ...prevBlockData,
            id: block.index,
            hash: block.hash,
            size: block.size,
            version: block.version,
            merkle_root: block.merkleRoot,
            time: block.time,
            nonce: block.nonce,
            next_validator_address_id: address.id,
            invocation_script: block.script.invocation,
            verification_script: block.script.verification,
            transaction_count: block.transactions.length,
            system_fee: systemFee.toFixed(8),
            network_fee: block.transactions
              .reduce(
                (networkFee, transaction) => networkFee.plus(new BigNumber(transaction.networkFee)),
                new BigNumber('0'),
              )
              .toFixed(8),
            aggregated_system_fee: aggregatedSystemFee.toFixed(8),
          })
          .returning('*')
          .first()
          .throwIfNotFound()
          .catch((error) => {
            if (error.code === CONFLICT_ERROR_CODE) {
              return BlockModel.query(context.db)
                .context(context.makeQueryContext(span))
                .where('id', block.index)
                .first()
                .throwIfNotFound();
            }
            throw error;
          }),
        context.systemFee.save(
          {
            index: block.index,
            value: aggregatedSystemFee.toFixed(8),
          },
          span,
        ),
      ]);

      return blockModel;
    },
    { name: 'neotracker_scrape_run_save_block' },
  );
}

async function processBlockFiltered(context: Context, monitor: Monitor, block: Block): Promise<BlockModel> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const systemFee = block.transactions.reduce(
        (sysFee, transaction) => sysFee.plus(new BigNumber(transaction.systemFee)),
        ZERO,
      );

      const prevBlockModel = await getPreviousBlockModel(context, span, block);
      const blockModel = await saveBlock(
        context,
        span,
        block,
        systemFee,
        prevBlockModel === undefined ? systemFee : new BigNumber(prevBlockModel.aggregated_system_fee).plus(systemFee),
        prevBlockModel,
      );

      // tslint:disable-next-line no-any
      let prevBlockModelPromise: Promise<any> = Promise.resolve();
      if (prevBlockModel !== undefined) {
        prevBlockModelPromise = prevBlockModel
          .$query(context.db)
          .context(context.makeQueryContext(span))
          .patch({
            next_block_id: blockModel.id,
          });
      }

      await Promise.all([prevBlockModelPromise, saveTransactions(context, span, block, blockModel)]);

      await updateKnownContractsBlockModelPostRun(context, span, block.index);
      await updateProcessedIndex(context, span, block.index);

      return blockModel;
    },
    { name: 'neotracker_scrape_run_process_block_filtered' },
  );
}

async function processMinerBlocksFiltered(
  context: Context,
  monitor: Monitor,
  blocks: ReadonlyArray<Block>,
): Promise<BlockModel> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const prevBlockModel = await getPreviousBlockModel(context, span, blocks[0]);

      if (prevBlockModel === undefined) {
        throw new Error('Something went wrong');
      }

      const blockModels = await Promise.all(
        blocks.map(async (block) =>
          saveBlock(context, span, block, ZERO, new BigNumber(prevBlockModel.aggregated_system_fee)),
        ),
      );

      const mutableIndexToBlockModel: { [id: number]: BlockModel } = {};
      const mutableIndexToBlockModelPatch: { [id: number]: Partial<BlockModel> } = {};
      const mutableIndexToPrevBlockModelPatch: { [id: number]: Partial<BlockModel> } = {};
      [prevBlockModel].concat(blockModels).forEach((blockModel) => {
        mutableIndexToBlockModel[blockModel.id] = blockModel;
        mutableIndexToBlockModelPatch[blockModel.id] = {
          previous_block_id: blockModel.id,
          previous_block_hash: blockModel.hash,
          validator_address_id: blockModel.next_validator_address_id,
        };

        mutableIndexToPrevBlockModelPatch[blockModel.id] = {
          next_block_id: blockModel.id,
          next_block_hash: blockModel.hash,
        };
      });

      await Promise.all([
        Promise.all(
          blockModels.map(async (blockModel) => {
            mutableIndexToBlockModel[blockModel.id] = await blockModel
              .$query(context.db)
              .context(context.makeQueryContext(span))
              .patch(mutableIndexToBlockModelPatch[blockModel.id - 1])
              .returning('*');
          }),
        ),

        Promise.all(
          blocks.map(async (block) => saveTransactions(context, span, block, mutableIndexToBlockModel[block.index])),
        ),
      ]);

      // Avoid lock contention and run separately
      await Promise.all(
        blockModels.map(async (blockModel) => {
          const currentPrevBlockModel = mutableIndexToBlockModel[blockModel.id - 1];
          mutableIndexToBlockModel[blockModel.id - 1] = await currentPrevBlockModel
            .$query(context.db)
            .context(context.makeQueryContext(span))
            .patch(mutableIndexToPrevBlockModelPatch[blockModel.id])
            .returning('*');
        }),
      );

      await updateProcessedIndex(context, span, blocks[blocks.length - 1].index);

      return mutableIndexToBlockModel[blockModels[blockModels.length - 1].id];
    },
    { name: 'neotracker_scrape_run_process_miner_blocks_filtered' },
  );
}

async function processBlock(context: Context, monitor: Monitor, block: Block): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const height = await getCurrentHeightBlock(context, span);
      if (block.index === height + 1) {
        // tslint:disable-next-line no-object-mutation
        context.prevBlock = await processBlockFiltered(context, span, block);
        // tslint:disable-next-line no-object-mutation
        context.currentHeight = context.prevBlock.id;
      }
    },
    { name: 'neotracker_scrape_run_process_block' },
  );
}

async function processMinerBlocks(context: Context, monitor: Monitor, blocks: ReadonlyArray<Block>): Promise<void> {
  return getMonitor(monitor).captureSpan(
    async (span) => {
      const height = await getCurrentHeightBlock(context, span);
      const filteredBlocks = blocks.filter((block) => block.index > height);
      if (filteredBlocks.length > 0) {
        // tslint:disable-next-line no-object-mutation
        context.prevBlock = await processMinerBlocksFiltered(context, span, blocks);
        // tslint:disable-next-line no-object-mutation
        context.currentHeight = context.prevBlock.id;
      }
    },
    { name: 'neotracker_scrape_run_process_miner_blocks' },
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
              transactionModel,
              asset: {
                type: 'NEP5',
                name,
                symbol,
                amount: totalSupply.toString(),
                precision: decimals.toNumber(),
              },
              hash: contractModel.id,
            },
            span,
          );

          return contract;
        }

        return undefined;
      },
      {
        name: 'neotracker_scrape_run_initialize_nep5_contract',
        error: {},
      },
    );
}

function watchContract$(context: Context, monitor: Monitor, contractModel: ContractModel): Observable<void> {
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
            await processContractActions(signal, context, span, contractModel, height + 1, nep5Contract);
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
}: {
  readonly catchup: boolean;
  readonly context: Context;
  readonly monitor: Monitor;
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

      let mutableMinerBlocks: Block[] = [];

      await AsyncIterableX.from(blocks).forEach(async (blockJSON) => {
        if (!signal.running) {
          throw new ExitError();
        }
        const block = normalizeBlock(blockJSON);

        // It's not safe to potentially update coins out of order.
        if (
          block.transactions.length === 1 &&
          block.transactions[0].type === 'MinerTransaction' &&
          block.transactions[0].vin.length === 0 &&
          block.transactions[0].vout.length === 0 &&
          catchup
        ) {
          mutableMinerBlocks.push(block);
        } else {
          if (mutableMinerBlocks.length > 0) {
            await processMinerBlocks(context, monitor, mutableMinerBlocks);
            mutableMinerBlocks = [];
          }

          // Catch up for new contracts
          if (context.contractModelsToProcess.length > 0) {
            const { contractModelsToProcess } = context;
            // tslint:disable-next-line no-object-mutation
            context.contractModelsToProcess = [];
            await Promise.all(
              contractModelsToProcess.map(async ([contractModel, nep5Contract]) =>
                processContractActions(signal, context, monitor, contractModel, block.index, nep5Contract),
              ),
            );

            contractModelsToProcess.forEach(([contractModel, nep5Contract]) => {
              if (
                contractModel.type === NEP5_CONTRACT_TYPE &&
                (nep5Contract as ReadSmartContract | undefined) !== undefined
              ) {
                // tslint:disable-next-line no-object-mutation
                context.nep5Contracts[add0x(contractModel.id)] = nep5Contract;
              }
            });
          }

          NEOTRACKER_SCRAPE_PERSISTING_BLOCK_INDEX_GAUGE.set(block.index);
          await monitor.captureSpanLog(async (span) => processBlock(context, span, block), {
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

export const run$ = (context: Context, monitorIn: Monitor) => {
  const monitor = getMonitor(monitorIn);

  return merge(
    concat(doRun$({ context, catchup: true, monitor }), doRun$({ context, catchup: false, monitor })),
    createContractObservable(monitor, context.db, context.makeQueryContext, context.blacklistNEP5Hashes$).pipe(
      scan<
        ReadonlyArray<ContractModel>,
        { readonly seenContracts: Set<string>; readonly contractModels: ReadonlyArray<ContractModel> }
      >(
        ({ seenContracts }, contractModels) => {
          const ids = new Set(contractModels.map((contractModel) => add0x(contractModel.id)));

          Object.keys(context.nep5Contracts).forEach((id) => {
            if (!ids.has(id)) {
              // tslint:disable-next-line no-dynamic-delete no-object-mutation
              delete context.nep5Contracts[id];
              seenContracts.delete(id);
            }
          });

          const outputContractModels = contractModels.filter(
            (contractModel) => !seenContracts.has(add0x(contractModel.id)),
          );

          outputContractModels.forEach((contractModel) => {
            seenContracts.add(add0x(contractModel.id));
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
      mergeMap((contractModel) => watchContract$(context, monitor, contractModel)),
    ),
  );
};

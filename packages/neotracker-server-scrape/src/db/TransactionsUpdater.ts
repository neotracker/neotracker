import { Block } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import {
  Asset as AssetModel,
  Block as BlockModel,
  transaction as dbTransaction,
  Transaction as TransactionModel,
} from 'neotracker-server-db';
import { GAS_ASSET_ID, utils } from 'neotracker-shared-utils';
import { raw } from 'objection';
import { CoinChanges, Context, TransactionData, TransactionModelData } from '../types';
import { getTransactionDataForClient, getTransactionDataForModel, reduceCoinChanges } from '../utils';
import { ActionsUpdater } from './ActionsUpdater';
import { AddressLastTransactionUpdater } from './AddressLastTransactionUpdater';
import { AddressToTransactionUpdater } from './AddressToTransactionUpdater';
import { AddressToTransferUpdater } from './AddressToTransferUpdater';
import { AssetToTransactionUpdater } from './AssetToTransactionUpdater';
import { ClaimsUpdater } from './ClaimsUpdater';
import { CoinsUpdater } from './CoinsUpdater';
import { DBUpdater } from './DBUpdater';
import { InputsUpdater } from './InputsUpdater';
import { OutputsUpdater } from './OutputsUpdater';
import { TransfersUpdater } from './TransfersUpdater';

export interface TransactionsSave {
  readonly block: Block;
}
export interface TransactionsRevert {
  readonly blockModel: BlockModel;
}
export interface TransactionsUpdaters {
  readonly actions: ActionsUpdater;
  readonly addressLastTransaction: AddressLastTransactionUpdater;
  readonly addressToTransaction: AddressToTransactionUpdater;
  readonly addressToTransfer: AddressToTransferUpdater;
  readonly assetToTransaction: AssetToTransactionUpdater;
  readonly claims: ClaimsUpdater;
  readonly coins: CoinsUpdater;
  readonly inputs: InputsUpdater;
  readonly outputs: OutputsUpdater;
  readonly transfers: TransfersUpdater;
}

const ZERO = new BigNumber('0');

export class TransactionsUpdater extends DBUpdater<TransactionsSave, TransactionsRevert> {
  private readonly updaters: TransactionsUpdaters;

  public constructor(
    context: Context,
    updaters: TransactionsUpdaters = {
      actions: new ActionsUpdater(context),
      addressLastTransaction: new AddressLastTransactionUpdater(context),
      addressToTransaction: new AddressToTransactionUpdater(context),
      addressToTransfer: new AddressToTransferUpdater(context),
      assetToTransaction: new AssetToTransactionUpdater(context),
      claims: new ClaimsUpdater(context),
      coins: new CoinsUpdater(context),
      inputs: new InputsUpdater(context),
      outputs: new OutputsUpdater(context),
      transfers: new TransfersUpdater(context),
    },
  ) {
    super(context);
    this.updaters = updaters;
  }

  public async save(monitor: Monitor, { block }: TransactionsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const transactions = await getTransactionDataForClient({
          monitor: span,
          context: this.context,
          transactions: [...block.transactions.entries()].map(([transactionIndex, transaction]) => ({
            transactionIndex,
            transaction,
          })),
        });

        await this.insertPreconditions(span, transactions, block.index, block.time);

        await Promise.all([
          this.insertTransactions(span, block.index, block.time, transactions),
          this.updaters.actions.save(span, {
            actions: _.flatMap(transactions, ({ actionDatas, transactionID, transactionHash }) =>
              actionDatas.map(({ action }) => ({ action, transactionID, transactionHash })),
            ),
          }),
          this.updaters.addressLastTransaction.save(span, {
            transactions: transactions.map(({ result: { addressIDs }, transactionID, transactionHash }) => ({
              addressIDs: Object.keys(addressIDs),
              transactionID,
              transactionHash,
            })),
            blockTime: block.time,
          }),
          this.updaters.addressToTransaction.save(span, {
            transactions: transactions.map(({ result: { addressIDs }, transactionID }) => ({
              addressIDs: Object.keys(addressIDs),
              transactionID,
            })),
          }),
          this.updaters.addressToTransfer.save(span, {
            transfers: _.flatMap(transactions, ({ actionDatas }) =>
              actionDatas
                .map(({ transfer }) => transfer)
                .filter(utils.notNull)
                .map(({ result: { fromAddressID, toAddressID, transferID } }) => ({
                  addressIDs: [fromAddressID, toAddressID].filter(utils.notNull),
                  transferID,
                })),
            ),
          }),
          this.updaters.assetToTransaction.save(span, {
            transactions: transactions.map(({ result: { assetIDs }, transactionID }) => ({
              assetIDs,
              transactionID,
            })),
          }),
          this.updaters.claims.save(span, {
            transactions: transactions.map(({ claims, transactionID, transactionHash }) => ({
              claims,
              transactionID,
              transactionHash,
            })),
          }),
          this.updaters.coins.save(span, {
            coinChanges: transactions.reduce<CoinChanges | undefined>(
              (acc, { result: { coinChanges } }) => reduceCoinChanges(acc, coinChanges),
              undefined,
            ),
            blockIndex: block.index,
          }),
          this.updaters.inputs.save(span, {
            transactions: transactions.map(({ inputs, transactionID, transactionHash }) => ({
              references: inputs,
              transactionID,
              transactionHash,
            })),
            blockIndex: block.index,
          }),
          this.updaters.outputs.save(span, {
            transactions: transactions.map(({ inputs, transaction, transactionID }) => ({
              inputs,
              transaction,
              transactionID,
            })),
            blockIndex: block.index,
          }),
          this.updaters.transfers.save(span, {
            transactions: _.flatMap(transactions, ({ actionDatas, transactionID, transactionHash, transactionIndex }) =>
              actionDatas
                .map(
                  ({ action, transfer }) =>
                    transfer === undefined
                      ? undefined
                      : {
                          action,
                          transferData: transfer,
                          transactionID,
                          transactionHash,
                          transactionIndex,
                        },
                )
                .filter(utils.notNull),
            ),
            blockIndex: block.index,
            blockTime: block.time,
          }),
        ]);
      },
      { name: 'neotracker_scrape_save_transactions' },
    );
  }

  public async revert(monitor: Monitor, { blockModel }: TransactionsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const transactions = await getTransactionDataForModel({
          monitor: span,
          context: this.context,
          blockModel,
        });

        const transactionIDs = transactions.map(({ transactionModel }) => transactionModel.id);
        await Promise.all([
          this.updaters.actions.revert(span, {
            transactionIDs,
          }),
          this.updaters.addressLastTransaction.revert(span, {
            addressIDs: _.flatMap(transactions, ({ result: { addressIDs } }) => Object.keys(addressIDs)),
            transactionIDs,
          }),
          this.updaters.addressToTransaction.revert(span, {
            transactions: transactions.map(({ result: { addressIDs }, transactionID }) => ({
              addressIDs: Object.keys(addressIDs),
              transactionID,
            })),
          }),
          this.updaters.addressToTransfer.revert(span, {
            transfers: _.flatMap(transactions, ({ actionDatas }) =>
              actionDatas
                .map(({ transfer }) => transfer)
                .filter(utils.notNull)
                .map(({ result: { fromAddressID, toAddressID, transferID } }) => ({
                  addressIDs: [fromAddressID, toAddressID].filter(utils.notNull),
                  transferID,
                })),
            ),
          }),
          this.updaters.assetToTransaction.revert(span, {
            transactions: transactions.map(({ result: { assetIDs }, transactionID }) => ({
              assetIDs,
              transactionID,
            })),
          }),
          this.updaters.claims.revert(span, {
            claims: _.flatMap(transactions.map(({ claims }) => claims)),
          }),
          this.updaters.coins.revert(span, {
            coinChanges: transactions.reduce<CoinChanges | undefined>(
              (acc, { result: { coinChanges } }) => reduceCoinChanges(acc, coinChanges),
              undefined,
            ),
            blockIndex: blockModel.id,
          }),
          this.updaters.inputs.revert(span, {
            references: _.flatMap(transactions.map(({ inputs }) => inputs)),
          }),
          this.updaters.outputs.revert(span, {
            outputs: _.flatMap(transactions.map(({ outputs }) => outputs)),
          }),
        ]);

        await this.revertPreconditions(span, transactions, blockModel.id);

        await Promise.all(
          transactions.map(({ transactionModel }) =>
            transactionModel
              .$query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .delete(),
          ),
        );
      },
      { name: 'neotracker_scrape_save_transactions' },
    );
  }

  private async insertPreconditions(
    monitor: Monitor,
    transactions: ReadonlyArray<TransactionData>,
    blockIndex: number,
    blockTime: number,
  ): Promise<void> {
    await Promise.all([
      Promise.all(
        _.flatMap(transactions, ({ result: { addressIDs } }) =>
          Object.entries(addressIDs).map(async ([hash, { startTransactionID, startTransactionHash }]) =>
            this.context.address.save(
              { hash, transactionID: startTransactionID, transactionHash: startTransactionHash, blockIndex, blockTime },
              monitor,
            ),
          ),
        ),
      ),
      Promise.all(
        transactions.map(async ({ transaction, transactionID, transactionHash }) => {
          switch (transaction.type) {
            case 'InvocationTransaction':
              // tslint:disable-next-line no-any
              await Promise.all<any, any>([
                transaction.invocationData.asset === undefined
                  ? Promise.resolve()
                  : this.context.asset.save(
                      {
                        asset: {
                          type: transaction.invocationData.asset.type,
                          name: transaction.invocationData.asset.name,
                          precision: transaction.invocationData.asset.precision,
                          owner: transaction.invocationData.asset.owner,
                          admin: transaction.invocationData.asset.admin,
                          amount: transaction.invocationData.asset.amount.toString(10),
                        },
                        transactionID,
                        transactionHash,
                        blockIndex,
                        blockTime,
                      },
                      monitor,
                    ),
                Promise.all(
                  transaction.invocationData.contracts.map(async (contract) =>
                    this.context.contract.save(
                      {
                        contract,
                        transactionID,
                        transactionHash,
                        blockIndex,
                        blockTime,
                      },
                      monitor,
                    ),
                  ),
                ),
              ]);
              break;
            case 'RegisterTransaction':
              await this.context.asset.save(
                {
                  transactionID,
                  transactionHash,
                  blockIndex,
                  blockTime,
                  asset: {
                    type: transaction.asset.type,
                    name: transaction.asset.name,
                    precision: transaction.asset.precision,
                    owner: transaction.asset.owner,
                    admin: transaction.asset.admin,
                    amount: transaction.asset.amount.toString(10),
                  },
                },
                monitor,
              );
              break;
            case 'PublishTransaction':
              await this.context.contract.save(
                {
                  contract: transaction.contract,
                  transactionID,
                  transactionHash,
                  blockIndex,
                  blockTime,
                },
                monitor,
              );
              break;
            default:
          }
        }),
      ),
    ]);
  }

  private async revertPreconditions(
    monitor: Monitor,
    transactions: ReadonlyArray<TransactionModelData>,
    blockIndex: number,
  ): Promise<void> {
    await Promise.all([
      Promise.all(
        _.flatMap(transactions, ({ result: { addressIDs } }) =>
          Object.entries(addressIDs).map(async ([hash, { startTransactionID }]) =>
            this.context.address.revert({ hash, transactionID: startTransactionID, blockIndex }, monitor),
          ),
        ),
      ),
      Promise.all(
        transactions.map(async ({ contractModels }) =>
          Promise.all(
            contractModels.map(async (contractModel) => this.context.contract.revert(contractModel.id, monitor)),
          ),
        ),
      ),
      Promise.all(
        transactions.map(async ({ transactionModel }) => {
          switch (transactionModel.type) {
            case 'InvocationTransaction':
              // tslint:disable-next-line no-any
              await this.context.asset.revert(transactionModel.hash, monitor);
              break;
            case 'RegisterTransaction':
              await this.context.asset.revert(transactionModel.hash, monitor);
              break;
            default:
          }
        }),
      ),
    ]);
  }

  private async insertTransactions(
    monitor: Monitor,
    blockIndex: number,
    blockTime: number,
    transactions: ReadonlyArray<TransactionData>,
  ): Promise<void> {
    const transactionsWithIssued = transactions.map(({ transaction, transactionIndex }) => {
      const issued = transaction.systemFee.plus(transaction.networkFee);

      return { transaction, transactionIndex, issued };
    });
    await Promise.all([
      _.flatMap(_.chunk(transactionsWithIssued, this.context.chunkSize), async (chunk) => {
        try {
          await dbTransaction(this.context.db, async (trx) => {
            const reducedIssued = chunk.reduce((acc, { issued }) => acc.plus(issued), ZERO);
            // tslint:disable-next-line no-any
            await Promise.all<any, any>([
              TransactionModel.query(trx)
                .context(this.context.makeQueryContext(monitor))
                .insert(
                  chunk.map(({ transaction, transactionIndex }) => ({
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
                    block_id: blockIndex,
                    block_time: blockTime,
                    index: transactionIndex,
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
                  })),
                ),
              reducedIssued.lte(0)
                ? Promise.resolve()
                : AssetModel.query(trx)
                    .context(this.context.makeQueryContext(monitor))
                    .where('id', GAS_ASSET_ID)
                    .patch({
                      // tslint:disable-next-line no-any
                      issued: raw('issued - ?', [reducedIssued.toString()]) as any,
                    }),
            ]);
          });
        } catch (error) {
          if (!this.isUniqueError(error)) {
            throw error;
          }
        }
      }),
    ]);
  }
}

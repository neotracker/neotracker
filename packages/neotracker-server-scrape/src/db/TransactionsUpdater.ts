import { Block } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import * as _ from 'lodash';
import { Block as BlockModel, Transaction as TransactionModel } from 'neotracker-server-db';
import { utils } from 'neotracker-shared-utils';
import { Context, TransactionData } from '../types';
import {
  getAddressesData,
  getAddressesForClient,
  getAssetsAndContractsForClient,
  getAssetsDataForClient,
  getAssetsDataForModel,
  getTransactionDataForClient,
  getTransactionDataForModel,
} from '../utils';
import { ActionsUpdater } from './ActionsUpdater';
import { AddressesDataUpdater } from './AddressesDataUpdater';
import { AddressesUpdater } from './AddressesUpdater';
import { AddressToTransactionUpdater } from './AddressToTransactionUpdater';
import { AddressToTransferUpdater } from './AddressToTransferUpdater';
import { AssetsDataUpdater } from './AssetsDataUpdater';
import { AssetsUpdater } from './AssetsUpdater';
import { AssetToTransactionUpdater } from './AssetToTransactionUpdater';
import { ClaimsUpdater } from './ClaimsUpdater';
import { CoinsUpdater } from './CoinsUpdater';
import { ContractsUpdater } from './ContractsUpdater';
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
  readonly addresses: AddressesUpdater;
  readonly addressesData: AddressesDataUpdater;
  readonly addressToTransaction: AddressToTransactionUpdater;
  readonly addressToTransfer: AddressToTransferUpdater;
  readonly assets: AssetsUpdater;
  readonly assetsData: AssetsDataUpdater;
  readonly assetToTransaction: AssetToTransactionUpdater;
  readonly claims: ClaimsUpdater;
  readonly coins: CoinsUpdater;
  readonly contracts: ContractsUpdater;
  readonly inputs: InputsUpdater;
  readonly outputs: OutputsUpdater;
  readonly transfers: TransfersUpdater;
}

export class TransactionsUpdater extends DBUpdater<TransactionsSave, TransactionsRevert> {
  private readonly updaters: TransactionsUpdaters;

  public constructor(
    context: Context,
    updaters: TransactionsUpdaters = {
      actions: new ActionsUpdater(context),
      addresses: new AddressesUpdater(context),
      addressesData: new AddressesDataUpdater(context),
      addressToTransaction: new AddressToTransactionUpdater(context),
      addressToTransfer: new AddressToTransferUpdater(context),
      assets: new AssetsUpdater(context),
      assetsData: new AssetsDataUpdater(context),
      assetToTransaction: new AssetToTransactionUpdater(context),
      claims: new ClaimsUpdater(context),
      coins: new CoinsUpdater(context),
      contracts: new ContractsUpdater(context),
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
        const transactionsIn = [...block.transactions.entries()].map(([transactionIndex, transaction]) => ({
          transactionIndex,
          transaction,
        }));
        // This potentially modified nep5Contracts, so it must come first on its own
        const { assets, contracts } = await getAssetsAndContractsForClient({
          monitor: span,
          context: this.context,
          transactions: transactionsIn,
          blockIndex: block.index,
          blockTime: block.time,
        });
        const transactions = await getTransactionDataForClient({
          monitor: span,
          context: this.context,
          blockIndex: block.index,
          transactions: transactionsIn,
        });
        const addresses = getAddressesForClient({ transactions, blockIndex: block.index, blockTime: block.time });
        const addressesData = getAddressesData(transactions);

        const [{ assets: assetsData, coinModelChanges }] = await Promise.all([
          getAssetsDataForClient({ monitor: span, context: this.context, transactions, blockIndex: block.index }),
          this.updaters.addresses.save(span, {
            addresses,
          }),
          this.updaters.assets.save(span, {
            assets,
          }),
        ]);

        await Promise.all([
          this.insertTransactions(span, block.index, block.time, transactions),
          this.updaters.actions.save(span, {
            actions: _.flatMap(transactions, ({ actionDatas, transactionID, transactionHash }) =>
              actionDatas.map(({ action }) => ({ action, transactionID, transactionHash })),
            ),
          }),
          this.updaters.addressesData.save(span, {
            addresses: addressesData,
            blockTime: block.time,
            blockIndex: block.index,
          }),
          this.updaters.addressToTransaction.save(span, {
            transactions: transactions.map(({ addressIDs, transactionID }) => ({
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
          this.updaters.assetsData.save(span, {
            assets: assetsData,
            blockIndex: block.index,
          }),
          this.updaters.assetToTransaction.save(span, {
            transactions,
          }),
          this.updaters.claims.save(span, {
            transactions,
          }),
          this.updaters.coins.save(span, {
            coinModelChanges,
          }),
          this.updaters.contracts.save(span, {
            contracts,
          }),
          this.updaters.inputs.save(span, {
            transactions,
            blockIndex: block.index,
          }),
          this.updaters.outputs.save(span, {
            transactions,
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
        const addressesData = getAddressesData(transactions);

        const { assets: assetsData, coinModelChanges } = await getAssetsDataForModel({
          monitor: span,
          context: this.context,
          transactions,
          blockIndex: blockModel.id,
        });

        const transactionIDs = transactions.map(({ transactionModel }) => transactionModel.id);
        await Promise.all([
          this.updaters.actions.revert(span, {
            transactionIDs,
          }),
          this.updaters.addressesData.revert(span, {
            addresses: addressesData,
            transactionIDs,
            blockIndex: blockModel.id,
          }),
          this.updaters.addressToTransaction.revert(span, {
            transactionIDs: transactions.map(({ transactionID }) => transactionID),
          }),
          this.updaters.addressToTransfer.revert(span, {
            transferIDs: _.flatMap(transactions, ({ actionDatas }) =>
              actionDatas
                .map(({ transfer }) => transfer)
                .filter(utils.notNull)
                .map(({ result: { transferID } }) => transferID),
            ),
          }),
          this.updaters.assetsData.revert(span, {
            assets: assetsData,
            blockIndex: blockModel.id,
          }),
          this.updaters.assetToTransaction.revert(span, {
            transactionIDs: transactions.map(({ transactionID }) => transactionID),
          }),
          this.updaters.claims.revert(span, {
            claims: _.flatMap(transactions.map(({ claims }) => claims)),
          }),
          this.updaters.coins.revert(span, {
            coinModelChanges,
          }),
          this.updaters.contracts.revert(span, {
            transactionIDs,
          }),
          this.updaters.inputs.revert(span, {
            references: _.flatMap(transactions.map(({ inputs }) => inputs)),
          }),
          this.updaters.outputs.revert(span, {
            outputs: _.flatMap(transactions.map(({ outputs }) => outputs)),
          }),
          this.updaters.transfers
            .revert(span, {
              transferIDs: _.flatMap(transactions, ({ actionDatas }) =>
                actionDatas
                  .map(({ action, transfer }) => (transfer === undefined ? undefined : action.id))
                  .filter(utils.notNull),
              ),
            })
            .then(async () =>
              this.updaters.assetToTransaction.save(span, {
                transactions: transactions.map(({ assetIDs, transactionID }) => ({
                  assetIDs,
                  transactionID,
                })),
              }),
            ),
        ]);

        await Promise.all([
          this.updaters.addresses.revert(span, {
            addresses: _.flatMap(transactions, ({ addressIDs }) =>
              Object.entries(addressIDs).map(([addressID, { startTransactionID }]) => ({
                id: addressID,
                transactionID: startTransactionID,
              })),
            ),
            blockIndex: blockModel.id,
          }),
          this.updaters.assets.revert(span, {
            transactionIDs,
          }),
        ]);

        await Promise.all(
          _.chunk(transactions, this.context.chunkSize).map((chunk) =>
            TransactionModel.query(this.context.db)
              .context(this.context.makeQueryContext(span))
              .whereIn('id', chunk.map(({ transactionModel }) => transactionModel.id))
              .delete(),
          ),
        );
      },
      { name: 'neotracker_scrape_revert_transactions' },
    );
  }

  private async insertTransactions(
    monitor: Monitor,
    blockIndex: number,
    blockTime: number,
    transactions: ReadonlyArray<TransactionData>,
  ): Promise<void> {
    await Promise.all(
      _.chunk(transactions, this.context.chunkSize).map(async (chunk) => {
        await TransactionModel.insertAll(
          this.context.db,
          this.context.makeQueryContext(monitor),
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
        );
      }),
    );
  }
}

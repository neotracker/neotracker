import { Block } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import _ from 'lodash';
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
    updaters: TransactionsUpdaters = {
      actions: new ActionsUpdater(),
      addresses: new AddressesUpdater(),
      addressesData: new AddressesDataUpdater(),
      addressToTransaction: new AddressToTransactionUpdater(),
      addressToTransfer: new AddressToTransferUpdater(),
      assets: new AssetsUpdater(),
      assetsData: new AssetsDataUpdater(),
      assetToTransaction: new AssetToTransactionUpdater(),
      claims: new ClaimsUpdater(),
      coins: new CoinsUpdater(),
      contracts: new ContractsUpdater(),
      inputs: new InputsUpdater(),
      outputs: new OutputsUpdater(),
      transfers: new TransfersUpdater(),
    },
  ) {
    super();
    this.updaters = updaters;
  }

  public async save(contextIn: Context, monitor: Monitor, { block }: TransactionsSave): Promise<Context> {
    return monitor.captureSpan(
      async (span) => {
        const transactionsIn = [...block.transactions.entries()].map(([transactionIndex, transaction]) => ({
          transactionIndex,
          transaction,
        }));
        const { assets, contracts, context } = await getAssetsAndContractsForClient({
          monitor: span,
          context: contextIn,
          transactions: transactionsIn,
          blockIndex: block.index,
          blockTime: block.time,
        });
        const transactions = await getTransactionDataForClient({
          monitor: span,
          context,
          blockIndex: block.index,
          transactions: transactionsIn,
        });
        const addresses = getAddressesForClient({ transactions, blockIndex: block.index, blockTime: block.time });
        const addressesData = getAddressesData(transactions);

        const [{ assets: assetsData, coinModelChanges }] = await Promise.all([
          getAssetsDataForClient({ monitor: span, context, transactions, blockIndex: block.index }),
          this.updaters.addresses.save(context, span, {
            addresses,
          }),
          this.updaters.assets.save(context, span, {
            assets,
          }),
        ]);

        await Promise.all([
          this.insertTransactions(context, span, block.index, block.time, transactions),
          this.updaters.actions.save(context, span, {
            actions: _.flatMap(transactions, ({ actionDatas, transactionID, transactionHash }) =>
              actionDatas.map(({ action }) => ({ action, transactionID, transactionHash })),
            ),
          }),
          this.updaters.addressesData.save(context, span, {
            addresses: addressesData,
            blockTime: block.time,
            blockIndex: block.index,
          }),
          this.updaters.addressToTransaction.save(context, span, {
            transactions: transactions.map(({ addressIDs, transactionID }) => ({
              addressIDs: Object.keys(addressIDs),
              transactionID,
            })),
          }),
          this.updaters.addressToTransfer.save(context, span, {
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
          this.updaters.assetsData.save(context, span, {
            assets: assetsData,
            blockIndex: block.index,
          }),
          this.updaters.assetToTransaction.save(context, span, {
            transactions,
          }),
          this.updaters.claims.save(context, span, {
            transactions,
          }),
          this.updaters.coins.save(context, span, {
            coinModelChanges,
          }),
          this.updaters.contracts.save(context, span, {
            contracts,
          }),
          this.updaters.inputs.save(context, span, {
            transactions,
            blockIndex: block.index,
          }),
          this.updaters.outputs.save(context, span, {
            transactions,
          }),
          this.updaters.transfers.save(context, span, {
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

        return context;
      },
      { name: 'neotracker_scrape_save_transactions' },
    );
  }

  public async revert(context: Context, monitor: Monitor, { blockModel }: TransactionsRevert): Promise<Context> {
    return monitor.captureSpan(
      async (span) => {
        const transactions = await getTransactionDataForModel({
          monitor: span,
          context,
          blockModel,
        });
        const addressesData = getAddressesData(transactions);

        const { assets: assetsData, coinModelChanges } = await getAssetsDataForModel({
          monitor: span,
          context,
          transactions,
          blockIndex: blockModel.id,
        });

        const transactionIDs = transactions.map(({ transactionModel }) => transactionModel.id);
        const contractIDs = _.flatMap(transactions, ({ contracts }) => contracts.map(({ id }) => id));
        await Promise.all([
          this.updaters.actions.revert(context, span, {
            transactionIDs,
          }),
          this.updaters.addressesData.revert(context, span, {
            addresses: addressesData,
            transactionIDs,
            blockIndex: blockModel.id,
          }),
          this.updaters.addressToTransaction.revert(context, span, {
            transactionIDs,
          }),
          this.updaters.addressToTransfer.revert(context, span, {
            transferIDs: _.flatMap(transactions, ({ actionDatas }) =>
              actionDatas
                .map(({ transfer }) => transfer)
                .filter(utils.notNull)
                .map(({ result: { transferID } }) => transferID),
            ),
          }),
          this.updaters.assetsData.revert(context, span, {
            assets: assetsData,
            blockIndex: blockModel.id,
          }),
          this.updaters.assetToTransaction.revert(context, span, {
            transactionIDs,
          }),
          this.updaters.claims.revert(context, span, {
            claims: _.flatMap(transactions.map(({ claims }) => claims)),
          }),
          this.updaters.coins.revert(context, span, {
            coinModelChanges,
          }),
          this.updaters.contracts.revert(context, span, {
            contractIDs,
          }),
          this.updaters.inputs.revert(context, span, {
            references: _.flatMap(transactions.map(({ inputs }) => inputs)),
          }),
          this.updaters.outputs.revert(context, span, {
            outputs: _.flatMap(transactions.map(({ outputs }) => outputs)),
          }),
          this.updaters.transfers
            .revert(context, span, {
              transferIDs: _.flatMap(transactions, ({ actionDatas }) =>
                actionDatas
                  .map(({ action, transfer }) => (transfer === undefined ? undefined : action.id))
                  .filter(utils.notNull),
              ),
            })
            .then(async () =>
              this.updaters.assetToTransaction.save(context, span, {
                transactions: transactions.map(({ assetIDs, transactionID }) => ({
                  assetIDs,
                  transactionID,
                })),
              }),
            ),
        ]);

        await Promise.all([
          this.updaters.addresses.revert(context, span, {
            addresses: _.flatMap(transactions, ({ addressIDs }) =>
              Object.entries(addressIDs).map(([addressID, { startTransactionID }]) => ({
                id: addressID,
                transactionID: startTransactionID,
              })),
            ),
            blockIndex: blockModel.id,
          }),
          this.updaters.assets.revert(context, span, {
            transactionIDs,
          }),
        ]);

        await Promise.all(
          _.chunk(transactions, context.chunkSize).map((chunk) =>
            TransactionModel.query(context.db)
              .context(context.makeQueryContext(span))
              .whereIn('id', chunk.map(({ transactionModel }) => transactionModel.id))
              .delete(),
          ),
        );

        const contractIDsSet = new Set(contractIDs);

        return {
          ...context,
          nep5Contracts: Object.entries(context.nep5Contracts).reduce<typeof context.nep5Contracts>(
            (acc, [contractID, nep5Contract]) =>
              contractIDsSet.has(contractID)
                ? acc
                : {
                    ...acc,
                    [contractID]: nep5Contract,
                  },
            {},
          ),
        };
      },
      { name: 'neotracker_scrape_revert_transactions' },
    );
  }

  private async insertTransactions(
    context: Context,
    monitor: Monitor,
    blockIndex: number,
    blockTime: number,
    transactions: ReadonlyArray<TransactionData>,
  ): Promise<void> {
    await Promise.all(
      _.chunk(transactions, context.chunkSize).map(async (chunk) => {
        await TransactionModel.insertAll(
          context.db,
          context.makeQueryContext(monitor),
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

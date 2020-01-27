import { Block } from '@neo-one/client-full';
import { createChild, serverLogger } from '@neotracker/logger';
import { Block as BlockModel, Transaction as TransactionModel } from '@neotracker/server-db';
import { utils } from '@neotracker/shared-utils';
import _ from 'lodash';
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

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

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

  public async save(contextIn: Context, { block }: TransactionsSave): Promise<Context> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_save_transactions' });
    const transactionsIn = [...block.transactions.entries()].map(([transactionIndex, transaction]) => ({
      transactionIndex,
      transaction,
    }));
    const { assets, contracts, context } = await getAssetsAndContractsForClient({
      context: contextIn,
      transactions: transactionsIn,
      blockIndex: block.index,
      blockTime: block.time,
    });
    const transactions = await getTransactionDataForClient({
      context,
      blockIndex: block.index,
      transactions: transactionsIn,
    });
    const addresses = getAddressesForClient({ transactions, blockIndex: block.index, blockTime: block.time });
    const addressesData = getAddressesData(transactions);

    const [{ assets: assetsData, coinModelChanges }] = await Promise.all([
      getAssetsDataForClient({ context, transactions, blockIndex: block.index }),
      this.updaters.addresses.save(context, {
        addresses,
      }),
      this.updaters.assets.save(context, {
        assets,
      }),
    ]);

    await Promise.all([
      this.insertTransactions(context, block.index, block.time, transactions),
      this.updaters.actions.save(context, {
        actions: _.flatMap(transactions, ({ actionDatas, transactionID, transactionHash }) =>
          actionDatas.map(({ action }) => ({ action, transactionID, transactionHash })),
        ),
      }),
      this.updaters.addressesData.save(context, {
        addresses: addressesData,
        blockTime: block.time,
        blockIndex: block.index,
      }),
      this.updaters.addressToTransaction.save(context, {
        transactions: transactions.map(({ addressIDs, transactionID }) => ({
          addressIDs: Object.keys(addressIDs),
          transactionID,
        })),
      }),
      this.updaters.addressToTransfer.save(context, {
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
      this.updaters.assetsData.save(context, {
        assets: assetsData,
        blockIndex: block.index,
      }),
      this.updaters.assetToTransaction.save(context, {
        transactions,
      }),
      this.updaters.claims.save(context, {
        transactions,
      }),
      this.updaters.coins.save(context, {
        coinModelChanges,
      }),
      this.updaters.contracts.save(context, {
        contracts,
      }),
      this.updaters.inputs.save(context, {
        transactions,
        blockIndex: block.index,
      }),
      this.updaters.outputs.save(context, {
        transactions,
      }),
      this.updaters.transfers.save(context, {
        transactions: _.flatMap(transactions, ({ actionDatas, transactionID, transactionHash, transactionIndex }) =>
          actionDatas
            .map(({ action, transfer }) =>
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
  }

  public async revert(context: Context, { blockModel }: TransactionsRevert): Promise<Context> {
    serverScrapeLogger.info({ title: 'neotracker_scrape_revert_transactions' });
    const transactions = await getTransactionDataForModel({
      context,
      blockModel,
    });
    const addressesData = getAddressesData(transactions);

    const { assets: assetsData, coinModelChanges } = await getAssetsDataForModel({
      context,
      transactions,
      blockIndex: blockModel.id,
    });
    const transactionIDs = transactions.map(({ transactionModel }) => transactionModel.id);
    const contractIDs = _.flatMap(transactions, ({ contracts }) => contracts.map(({ id }) => id));
    await Promise.all([
      this.updaters.actions.revert(context, {
        transactionIDs,
      }),
      this.updaters.addressesData.revert(context, {
        addresses: addressesData,
        transactionIDs,
        blockIndex: blockModel.id,
      }),
      this.updaters.addressToTransaction.revert(context, {
        transactionIDs,
      }),
      this.updaters.addressToTransfer.revert(context, {
        transferIDs: _.flatMap(transactions, ({ actionDatas }) =>
          actionDatas
            .map(({ transfer }) => transfer)
            .filter(utils.notNull)
            .map(({ result: { transferID } }) => transferID),
        ),
      }),
      this.updaters.assetsData.revert(context, {
        assets: assetsData,
        blockIndex: blockModel.id,
      }),
      this.updaters.assetToTransaction.revert(context, {
        transactionIDs,
      }),
      this.updaters.claims.revert(context, {
        claims: _.flatMap(transactions.map(({ claims }) => claims)),
      }),
      this.updaters.coins.revert(context, {
        coinModelChanges,
      }),
      this.updaters.contracts.revert(context, {
        contractIDs,
      }),
      this.updaters.inputs.revert(context, {
        references: _.flatMap(transactions.map(({ inputs }) => inputs)),
      }),
      this.updaters.outputs.revert(context, {
        outputIDs: transactions.reduce(
          (acc: ReadonlyArray<string>, transaction) => acc.concat(transaction.outputs.map((output) => output.id)),
          [],
        ),
      }),
      this.updaters.transfers.revert(context, {
        transferIDs: _.flatMap(transactions, ({ actionDatas }) =>
          actionDatas
            .map(({ action, transfer }) => (transfer === undefined ? undefined : action.id))
            .filter(utils.notNull),
        ),
      }),
    ]);

    await Promise.all([
      this.updaters.addresses.revert(context, {
        addresses: _.flatMap(transactions, ({ addressIDs }) =>
          Object.entries(addressIDs).map(([addressID, { startTransactionID }]) => ({
            id: addressID,
            transactionID: startTransactionID,
          })),
        ),
        blockIndex: blockModel.id,
      }),
      this.updaters.assets.revert(context, {
        transactionIDs,
      }),
    ]);
    await Promise.all(
      _.chunk(transactions, context.chunkSize).map((chunk) =>
        TransactionModel.query(context.db)
          .context(context.makeQueryContext())
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
  }

  private async insertTransactions(
    context: Context,
    blockIndex: number,
    blockTime: number,
    transactions: ReadonlyArray<TransactionData>,
  ): Promise<void> {
    await Promise.all(
      _.chunk(transactions, context.chunkSize).map(async (chunk) => {
        await TransactionModel.insertAll(
          context.db,
          context.makeQueryContext(),
          chunk.map(({ transaction, transactionIndex }) => ({
            id: transaction.receipt.globalIndex.toString(),
            hash: transaction.hash,
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

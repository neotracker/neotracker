import { ActionRaw, ReadSmartContract } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import { utils } from 'neotracker-shared-utils';
import { Context } from '../types';
import { getContractActionDataForClient } from '../utils';
import { ActionsUpdater } from './ActionsUpdater';
import { AddressLastTransactionUpdater } from './AddressLastTransactionUpdater';
import { AddressToTransactionUpdater } from './AddressToTransactionUpdater';
import { AddressToTransferUpdater } from './AddressToTransferUpdater';
import { AssetToTransactionUpdater } from './AssetToTransactionUpdater';
import { CoinsUpdater } from './CoinsUpdater';
import { DBUpdater } from './DBUpdater';
import { KnownContractUpdater } from './KnownContractUpdater';
import { TransfersUpdater } from './TransfersUpdater';

export interface ContractActionSave {
  readonly action: ActionRaw;
  readonly nep5Contract: ReadSmartContract;
}

export interface ContractActionUpdaters {
  readonly actions: ActionsUpdater;
  readonly addressLastTransaction: AddressLastTransactionUpdater;
  readonly addressToTransaction: AddressToTransactionUpdater;
  readonly addressToTransfer: AddressToTransferUpdater;
  readonly assetToTransaction: AssetToTransactionUpdater;
  readonly coins: CoinsUpdater;
  readonly knownContract: KnownContractUpdater;
  readonly transfers: TransfersUpdater;
}

export class ContractActionUpdater extends DBUpdater<ContractActionSave, never> {
  private readonly updaters: ContractActionUpdaters;

  public constructor(
    context: Context,
    updaters: ContractActionUpdaters = {
      actions: new ActionsUpdater(context),
      addressLastTransaction: new AddressLastTransactionUpdater(context),
      addressToTransaction: new AddressToTransactionUpdater(context),
      addressToTransfer: new AddressToTransferUpdater(context),
      assetToTransaction: new AssetToTransactionUpdater(context),
      coins: new CoinsUpdater(context),
      knownContract: new KnownContractUpdater(context),
      transfers: new TransfersUpdater(context),
    },
  ) {
    super(context);
    this.updaters = updaters;
  }

  public async save(monitor: Monitor, { action, nep5Contract }: ContractActionSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        const {
          transactionID,
          transactionHash,
          transactionIndex,
          result,
          blockIndex,
          blockTime,
          actionData,
        } = await getContractActionDataForClient({
          monitor: span,
          context: this.context,
          action,
          nep5Contract,
        });

        await Promise.all(
          Object.entries(result.addressIDs).map(async ([hash, { startTransactionID, startTransactionHash }]) =>
            this.context.address.save(
              { hash, transactionID: startTransactionID, transactionHash: startTransactionHash, blockIndex, blockTime },
              monitor,
            ),
          ),
        );

        await Promise.all([
          this.updaters.actions.save(span, { actions: [{ action, transactionID, transactionHash }] }),
          this.updaters.addressLastTransaction
            .save(span, {
              transactions: [
                {
                  addressIDs: Object.keys(result.addressIDs),
                  transactionID,
                  transactionHash,
                  transactionIndex,
                },
              ],
              blockTime,
            })
            .then(async () =>
              this.updaters.addressToTransaction.save(span, {
                transactions: [
                  {
                    addressIDs: Object.keys(result.addressIDs),
                    transactionID,
                  },
                ],
              }),
            )
            .then(async () =>
              this.updaters.addressToTransfer.save(span, {
                transfers: [actionData]
                  .map(({ transfer }) => transfer)
                  .filter(utils.notNull)
                  .map(({ result: { fromAddressID, toAddressID, transferID } }) => ({
                    addressIDs: [fromAddressID, toAddressID].filter(utils.notNull),
                    transferID,
                  })),
              }),
            ),
          this.updaters.coins.save(span, {
            coinChanges: result.coinChanges,
            blockIndex,
          }),
          this.updaters.transfers
            .save(span, {
              transactions: [actionData]
                .map(
                  ({ action: actionIn, transfer }) =>
                    transfer === undefined
                      ? undefined
                      : {
                          action: actionIn,
                          transferData: transfer,
                          transactionID,
                          transactionHash,
                          transactionIndex,
                        },
                )
                .filter(utils.notNull),
              blockIndex,
              blockTime,
            })
            .then(async () =>
              this.updaters.assetToTransaction.save(span, {
                transactions: [
                  {
                    assetIDs: result.assetIDs,
                    transactionID,
                  },
                ],
              }),
            ),
        ]);

        await this.updaters.knownContract.save(span, {
          id: action.scriptHash,
          blockIndex,
          globalActionIndex: action.globalIndex,
        });
      },
      { name: 'neotracker_scrape_save_contract_action' },
    );
  }

  public async revert(_monitor: Monitor, _revert: never): Promise<void> {
    throw new Error('Not Implemented');
  }
}

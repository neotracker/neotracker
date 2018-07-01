import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import { Action as ActionModel, Transfer as TransferModel } from 'neotracker-server-db';
import { utils } from 'neotracker-shared-utils';
import { ActionData, DBContext } from '../types';

export async function getActionDataForModel({
  context,
  monitor,
  actionModel,
}: {
  readonly context: DBContext;
  readonly monitor: Monitor;
  readonly actionModel: ActionModel;
}): Promise<ActionData<ActionModel>> {
  const transferModel = await actionModel
    .$relatedQuery<TransferModel>('transfer', context.db)
    .context(context.makeQueryContext(monitor))
    .first();
  if (transferModel === undefined) {
    return { action: actionModel };
  }

  const value = new BigNumber(transferModel.value);
  const result = {
    fromAddressID: transferModel.from_address_id,
    toAddressID: transferModel.to_address_id,
    assetID: transferModel.asset_id,
    transferID: transferModel.id,
    coinChanges: {
      transactionIndex: transferModel.transaction_index,
      actionIndex: transferModel.action_index,
      transactionID: transferModel.transaction_id,
      transactionHash: transferModel.transaction_hash,
      changes: [
        transferModel.from_address_id === undefined
          ? undefined
          : {
              address: transferModel.from_address_id,
              asset: transferModel.asset_id,
              value: value.negated(),
            },
        transferModel.to_address_id === undefined
          ? undefined
          : {
              address: transferModel.to_address_id,
              asset: transferModel.asset_id,
              value,
            },
      ].filter(utils.notNull),
    },
  };

  return { action: actionModel, transfer: { value, result } };
}

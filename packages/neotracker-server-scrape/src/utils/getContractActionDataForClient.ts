import { ActionRaw, ReadSmartContract } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import { Block as BlockModel, Transaction as TransactionModel } from 'neotracker-server-db';
import { ContractActionData, DBContext } from '../types';
import { getActionDataForClient } from './getActionDataForClient';
import { getActionDataInputOutputResult } from './getActionDataInputOutputResult';

export async function getContractActionDataForClient({
  monitor,
  context,
  action,
  nep5Contract,
}: {
  readonly monitor: Monitor;
  readonly context: DBContext;
  readonly action: ActionRaw;
  readonly nep5Contract: ReadSmartContract;
}): Promise<ContractActionData> {
  const [blockModel, transactionModel] = await Promise.all([
    BlockModel.query(context.db)
      .context(context.makeQueryContext(monitor))
      .where('id', action.blockIndex)
      .first()
      .throwIfNotFound(),
    TransactionModel.query(context.db)
      .context(context.makeQueryContext(monitor))
      .where('hash', action.transactionHash)
      .first()
      .throwIfNotFound(),
  ]);

  const transactionID = transactionModel.id;
  const transactionHash = transactionModel.hash;
  const transactionIndex = transactionModel.index;

  const actionData = getActionDataForClient({
    context,
    action,
    nep5Contract,
    transactionID,
    transactionHash,
    transactionIndex,
  });

  const result = getActionDataInputOutputResult({
    actionDatas: [actionData],
    transactionID,
    transactionHash,
    transactionIndex,
  });

  return {
    actionData,
    result,
    transactionHash,
    transactionID,
    transactionIndex,
    blockIndex: blockModel.id,
    blockTime: blockModel.time,
  };
}

import { Monitor } from '@neo-one/monitor';
import {
  Action as ActionModel,
  Block as BlockModel,
  Contract as ContractModel,
  Transaction as TransactionModel,
  TransactionInputOutput as TransactionInputOutputModel,
} from 'neotracker-server-db';
import { DBContext, TransactionModelData } from '../types';
import { getActionDataForModel } from './getActionDataForModel';
import { getInputOutputResultForModel } from './getInputOutputResultForModel';

export async function getTransactionDataForModel({
  monitor,
  context,
  blockModel,
}: {
  readonly monitor: Monitor;
  readonly context: DBContext;
  readonly blockModel: BlockModel;
}): Promise<ReadonlyArray<TransactionModelData>> {
  const transactions = await blockModel
    .$relatedQuery<TransactionModel>('transactions', context.db)
    .context(context.makeQueryContext(monitor));

  return Promise.all(
    transactions.map(async (transactionModel) => {
      const [inputs, outputs, claims, actions, contractModels] = await Promise.all([
        transactionModel
          .$relatedQuery<TransactionInputOutputModel>('inputs', context.db)
          .context(context.makeQueryContext(monitor)),
        transactionModel
          .$relatedQuery<TransactionInputOutputModel>('outputs', context.db)
          .context(context.makeQueryContext(monitor)),
        transactionModel
          .$relatedQuery<TransactionInputOutputModel>('claims', context.db)
          .context(context.makeQueryContext(monitor)),
        transactionModel.$relatedQuery<ActionModel>('actions', context.db).context(context.makeQueryContext(monitor)),
        transactionModel
          .$relatedQuery<ContractModel>('contracts', context.db)
          .context(context.makeQueryContext(monitor)),
      ]);

      const actionDatas = await Promise.all(
        actions.map(async (actionModel) => getActionDataForModel({ context, monitor, actionModel })),
      );

      const result = getInputOutputResultForModel({
        transactionModel,
        inputs,
        outputs,
        claims,
        actionDatas,
      });

      return {
        inputs,
        outputs,
        claims,
        transactionModel,
        transactionID: transactionModel.id,
        actionDatas,
        contractModels,
        result,
      };
    }),
  );
}

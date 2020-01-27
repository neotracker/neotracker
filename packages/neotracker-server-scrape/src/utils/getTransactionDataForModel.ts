import {
  Action as ActionModel,
  Block as BlockModel,
  Contract as ContractModel,
  Transaction as TransactionModel,
  TransactionInputOutput as TransactionInputOutputModel,
} from '@neotracker/server-db';
import { Context, TransactionModelData } from '../types';
import { getActionDataForModel } from './getActionDataForModel';
import { getInputOutputResultForModel } from './getInputOutputResultForModel';

export async function getTransactionDataForModel({
  context,
  blockModel,
}: {
  readonly context: Context;
  readonly blockModel: BlockModel;
}): Promise<ReadonlyArray<TransactionModelData>> {
  const transactions = await blockModel
    .$relatedQuery<TransactionModel>('transactions', context.db)
    .context(context.makeQueryContext());

  return Promise.all(
    transactions.map(async (transactionModel) => {
      const [inputs, outputs, claims, actions, contracts] = await Promise.all([
        transactionModel
          .$relatedQuery<TransactionInputOutputModel>('inputs', context.db)
          .context(context.makeQueryContext()),
        transactionModel
          .$relatedQuery<TransactionInputOutputModel>('outputs', context.db)
          .context(context.makeQueryContext()),
        transactionModel
          .$relatedQuery<TransactionInputOutputModel>('claims', context.db)
          .context(context.makeQueryContext()),
        transactionModel.$relatedQuery<ActionModel>('actions', context.db).context(context.makeQueryContext()),
        transactionModel.$relatedQuery<ContractModel>('contracts', context.db).context(context.makeQueryContext()),
      ]);

      const actionDatas = await Promise.all(
        actions.map(async (actionModel) => getActionDataForModel({ context, actionModel })),
      );

      const result = await getInputOutputResultForModel({
        context,
        transactionModel,
        inputs,
        outputs,
        claims,
        actionDatas,
      });

      return {
        ...result,
        inputs,
        outputs,
        claims,
        transactionModel,
        transactionID: transactionModel.id,
        transactionHash: transactionModel.hash,
        transactionIndex: transactionModel.index,
        actionDatas,
        contracts,
      };
    }),
  );
}

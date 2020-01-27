import {
  Asset as AssetModel,
  Transaction as TransactionModel,
  TransactionInputOutput as TransactionInputOutputModel,
} from '@neotracker/server-db';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { ActionData, Context, InputOutputResult } from '../types';
import { getActionDataInputOutputResult } from './getActionDataInputOutputResult';
import { EMPTY_INPUT_OUTPUT_RESULT, reduceInputOutputResults } from './reduceInputOutputResults';

export async function getInputOutputResultForModel({
  context,
  transactionModel,
  inputs,
  outputs,
  claims,
  actionDatas,
}: {
  readonly context: Context;
  readonly transactionModel: TransactionModel;
  readonly inputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly outputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly claims: ReadonlyArray<TransactionInputOutputModel>;
  // tslint:disable-next-line no-any
  readonly actionDatas: ReadonlyArray<ActionData<any>>;
}): Promise<InputOutputResult> {
  const transactionIndex = transactionModel.index;
  const transactionID = transactionModel.id;
  const transactionHash = transactionModel.hash;
  const addressData = {
    startTransactionID: transactionID,
    startTransactionIndex: transactionIndex,
    startTransactionHash: transactionHash,
  };

  const inputsResult = {
    addressIDs: _.fromPairs(inputs.map((input) => [input.address_id, addressData])),
    assetIDs: inputs.map((input) => input.asset_id),
    coinChanges: inputs.map((input) => ({
      address: input.address_id,
      asset: input.asset_id,
      value: new BigNumber(input.value).negated(),
    })),
  };

  const outputsResult = {
    addressIDs: _.fromPairs(outputs.map((output) => [output.address_id, addressData])),
    assetIDs: outputs.map((output) => output.asset_id),
    coinChanges: outputs.map((output) => ({
      address: output.address_id,
      asset: output.asset_id,
      value: new BigNumber(output.value),
    })),
  };

  const claimsResult = {
    addressIDs: _.fromPairs(claims.map((claim) => [claim.address_id, addressData])),
    assetIDs: claims.map((claim) => claim.asset_id),
  };

  const invocationResult = getActionDataInputOutputResult({
    actionDatas,
    transactionID: transactionModel.id,
    transactionHash: transactionModel.hash,
    transactionIndex: transactionModel.index,
  });

  let assetsResult = EMPTY_INPUT_OUTPUT_RESULT;
  if (transactionModel.type === 'RegisterTransaction' || transactionModel.type === 'InvocationTransaction') {
    const asset = await transactionModel
      .$relatedQuery<AssetModel>('asset', context.db)
      .context(context.makeQueryContext())
      .first();
    if (asset !== undefined) {
      assetsResult = {
        addressIDs: _.fromPairs([[asset.admin_address_id, addressData]]),
        assetIDs: [transactionModel.hash],
      };
    }
  }

  return reduceInputOutputResults([inputsResult, outputsResult, claimsResult, invocationResult, assetsResult]);
}

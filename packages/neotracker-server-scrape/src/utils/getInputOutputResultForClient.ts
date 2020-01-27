import { ConfirmedTransaction } from '@neo-one/client-full';
import { TransactionInputOutput as TransactionInputOutputModel } from '@neotracker/server-db';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { ActionData, InputOutputResult } from '../types';
import { getActionDataInputOutputResult } from './getActionDataInputOutputResult';
import { EMPTY_INPUT_OUTPUT_RESULT, reduceInputOutputResults } from './reduceInputOutputResults';

export function getInputOutputResultForClient({
  transaction,
  transactionIndex,
  inputs,
  claims,
  actionDatas,
}: {
  readonly transaction: ConfirmedTransaction;
  readonly transactionIndex: number;
  readonly inputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly claims: ReadonlyArray<TransactionInputOutputModel>;
  // tslint:disable-next-line no-any
  readonly actionDatas: ReadonlyArray<ActionData<any>>;
}): InputOutputResult {
  const transactionID = transaction.receipt.globalIndex.toString();
  const transactionHash = transaction.hash;
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
    addressIDs: _.fromPairs(transaction.outputs.map((output) => [output.address, addressData])),
    assetIDs: transaction.outputs.map((output) => output.asset),
    coinChanges: transaction.outputs.map((output) => ({
      address: output.address,
      asset: output.asset,
      value: new BigNumber(output.value),
    })),
  };

  const claimsResult = {
    addressIDs: _.fromPairs(claims.map((claim) => [claim.address_id, addressData])),
    assetIDs: claims.map((claim) => claim.asset_id),
  };

  const invocationResult = getActionDataInputOutputResult({
    actionDatas,
    transactionID,
    transactionHash,
    transactionIndex,
  });

  let assetsResult = EMPTY_INPUT_OUTPUT_RESULT;
  if (transaction.type === 'RegisterTransaction') {
    assetsResult = { addressIDs: _.fromPairs([[transaction.asset.admin, addressData]]), assetIDs: [transaction.hash] };
  } else if (transaction.type === 'InvocationTransaction' && transaction.invocationData.asset !== undefined) {
    assetsResult = {
      addressIDs: _.fromPairs([[transaction.invocationData.asset.admin, addressData]]),
      assetIDs: [transaction.hash],
    };
  }

  return reduceInputOutputResults([inputsResult, outputsResult, claimsResult, invocationResult, assetsResult]);
}

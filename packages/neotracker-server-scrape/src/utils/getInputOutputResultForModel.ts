import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import {
  Transaction as TransactionModel,
  TransactionInputOutput as TransactionInputOutputModel,
} from 'neotracker-server-db';
import { ActionData, InputOutputResult } from '../types';
import { getActionDataInputOutputResult } from './getActionDataInputOutputResult';
import { reduceInputOutputResults } from './reduceInputOutputResults';

export function getInputOutputResultForModel({
  transactionModel,
  inputs,
  outputs,
  claims,
  actionDatas,
}: {
  readonly transactionModel: TransactionModel;
  readonly inputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly outputs: ReadonlyArray<TransactionInputOutputModel>;
  readonly claims: ReadonlyArray<TransactionInputOutputModel>;
  // tslint:disable-next-line no-any
  readonly actionDatas: ReadonlyArray<ActionData<any>>;
}): InputOutputResult {
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
    coinChanges: {
      transactionIndex,
      transactionID,
      transactionHash,
      changes: inputs.map((input) => ({
        address: input.address_id,
        asset: input.asset_id,
        value: new BigNumber(input.value).negated(),
      })),
    },
  };

  const outputsResult = {
    addressIDs: _.fromPairs(outputs.map((output) => [output.address_id, addressData])),
    assetIDs: outputs.map((output) => output.asset_id),
    coinChanges: {
      transactionIndex,
      transactionID,
      transactionHash,
      changes: outputs.map((output) => ({
        address: output.address_id,
        asset: output.asset_id,
        value: new BigNumber(output.value),
      })),
    },
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

  return reduceInputOutputResults([inputsResult, outputsResult, claimsResult, invocationResult]);
}

import { ConfirmedTransaction } from '@neo-one/client-full';
import {
  SUBTYPE_CLAIM,
  SUBTYPE_ENROLLMENT,
  SUBTYPE_ISSUE,
  SUBTYPE_NONE,
  SUBTYPE_REWARD,
  TransactionInputOutput as TransactionInputOutputModel,
} from '@neotracker/server-db';
import { GAS_ASSET_HASH } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

const ZERO = new BigNumber('0');

export interface IssuedOutputs {
  readonly [assetID: string]: BigNumber | undefined;
}

export const getIssuedOutputs = (
  references: ReadonlyArray<TransactionInputOutputModel>,
  transaction: ConfirmedTransaction,
): IssuedOutputs => {
  const mutableValues: { [name: string]: BigNumber } = {};
  references.forEach((input) => {
    if ((mutableValues[input.asset_id] as BigNumber | undefined) === undefined) {
      mutableValues[input.asset_id] = new BigNumber('0');
    }

    mutableValues[input.asset_id] = mutableValues[input.asset_id].plus(new BigNumber(input.value));
  });

  if ((mutableValues[GAS_ASSET_HASH] as BigNumber | undefined) === undefined) {
    mutableValues[GAS_ASSET_HASH] = new BigNumber('0');
  }

  mutableValues[GAS_ASSET_HASH] = mutableValues[GAS_ASSET_HASH].minus(transaction.systemFee).minus(
    transaction.networkFee,
  );

  transaction.outputs.forEach((otherOutput) => {
    if ((mutableValues[otherOutput.asset] as BigNumber | undefined) === undefined) {
      mutableValues[otherOutput.asset] = new BigNumber('0');
    }

    mutableValues[otherOutput.asset] = mutableValues[otherOutput.asset].minus(new BigNumber(otherOutput.value));
  });

  return _.pickBy(mutableValues, (value) => !value.isEqualTo(ZERO));
};

export function getSubtype(
  issuedOutputs: IssuedOutputs,
  transaction: ConfirmedTransaction,
  assetID: string,
  outputIndex: number,
): string {
  if (transaction.type === 'EnrollmentTransaction' && outputIndex === 0) {
    return SUBTYPE_ENROLLMENT;
  }

  if (issuedOutputs[assetID] !== undefined) {
    return SUBTYPE_ISSUE;
  }

  if (transaction.type === 'ClaimTransaction') {
    return SUBTYPE_CLAIM;
  }

  if (transaction.type === 'MinerTransaction') {
    return SUBTYPE_REWARD;
  }

  return SUBTYPE_NONE;
}

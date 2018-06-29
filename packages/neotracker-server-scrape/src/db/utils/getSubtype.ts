import { ConfirmedTransaction, Output } from '@neo-one/client';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import {
  SUBTYPE_CLAIM,
  SUBTYPE_ENROLLMENT,
  SUBTYPE_ISSUE,
  SUBTYPE_NONE,
  SUBTYPE_REWARD,
  TransactionInputOutput as TransactionInputOutputModel,
} from 'neotracker-server-db';
import { GAS_ASSET_HASH } from 'neotracker-shared-utils';

const ZERO = new BigNumber('0');

function isIssue(
  output: Output,
  references: ReadonlyArray<TransactionInputOutputModel>,
  transaction: ConfirmedTransaction,
): boolean {
  if (transaction.type !== 'IssueTransaction') {
    return false;
  }

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

  transaction.vout.forEach((otherOutput) => {
    if ((mutableValues[otherOutput.asset] as BigNumber | undefined) === undefined) {
      mutableValues[otherOutput.asset] = new BigNumber('0');
    }

    mutableValues[otherOutput.asset] = mutableValues[otherOutput.asset].minus(new BigNumber(otherOutput.value));
  });

  const nonZeroValues = _.pickBy(mutableValues, (value) => !value.isEqualTo(ZERO));

  return nonZeroValues[output.asset] !== undefined;
}

export function getSubtype(
  output: Output,
  references: ReadonlyArray<TransactionInputOutputModel>,
  transaction: ConfirmedTransaction,
  outputIndex: number,
): string {
  if (transaction.type === 'EnrollmentTransaction' && outputIndex === 0) {
    return SUBTYPE_ENROLLMENT;
  }

  if (isIssue(output, references, transaction)) {
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

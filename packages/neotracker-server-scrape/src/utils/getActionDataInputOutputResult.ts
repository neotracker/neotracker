import { utils } from '@neotracker/shared-utils';
import _ from 'lodash';
import { ActionData, CoinChanges, InputOutputResult } from '../types';
import { reduceCoinChanges } from './reduceCoinChanges';

export function getActionDataInputOutputResult({
  actionDatas,
  transactionID,
  transactionHash,
  transactionIndex,
}: {
  // tslint:disable-next-line no-any
  readonly actionDatas: ReadonlyArray<ActionData<any>>;
  readonly transactionID: string;
  readonly transactionHash: string;
  readonly transactionIndex: number;
}): InputOutputResult {
  const addressData = {
    startTransactionID: transactionID,
    startTransactionIndex: transactionIndex,
    startTransactionHash: transactionHash,
  };

  const changes = actionDatas
    .map(({ transfer }) => transfer)
    .filter(utils.notNull)
    .map((transfer) => transfer.result);

  const mutableAddressIDs: string[] = [];
  const mutableAssetIDs: string[] = [];
  let coinChanges: CoinChanges | undefined;

  changes.forEach(({ fromAddressID, toAddressID, assetID, coinChanges: coinChangesIn }) => {
    if (fromAddressID !== undefined) {
      mutableAddressIDs.push(fromAddressID);
    }
    if (toAddressID !== undefined) {
      mutableAddressIDs.push(toAddressID);
    }
    mutableAssetIDs.push(assetID);
    coinChanges = reduceCoinChanges(coinChanges, coinChangesIn);
  });

  return {
    addressIDs: _.fromPairs([...new Set(mutableAddressIDs)].map((address) => [address, addressData])),
    assetIDs: [...new Set(mutableAssetIDs)],
    coinChanges,
  };
}

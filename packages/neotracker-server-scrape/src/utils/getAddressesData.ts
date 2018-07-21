import { utils } from '@neotracker/shared-utils';
import _ from 'lodash';
import { ActionData, AddressData, Addresses, InputOutputResultAddressIDs } from '../types';
import { getEdgeCount } from './getEdgeCount';
import { getValue } from './getValue';

interface TransactionData {
  readonly addressIDs: InputOutputResultAddressIDs;
  readonly transactionID: string;
  readonly transactionIndex: number;
  readonly transactionHash: string;
  // tslint:disable-next-line no-any
  readonly actionDatas: ReadonlyArray<ActionData<any>>;
}

export const getAddressesData = (transactions: ReadonlyArray<TransactionData>): Addresses => {
  const addressTransactionCounts = getEdgeCount(
    _.flatMap(transactions, ({ addressIDs, transactionID }) =>
      [...new Set(Object.keys(addressIDs))].map((addressID) => ({
        id1: addressID,
        id2: transactionID,
      })),
    ),
  );
  const addressTransferCounts = getEdgeCount(
    _.flatMap(
      _.flatMap(transactions, ({ actionDatas }) =>
        actionDatas
          .map(({ transfer }) => transfer)
          .filter(utils.notNull)
          .map(({ result: { fromAddressID, toAddressID, transferID } }) => ({
            addressIDs: [fromAddressID, toAddressID].filter(utils.notNull),
            transferID,
          })),
      ),
      ({ addressIDs, transferID }) =>
        [...new Set(addressIDs)].map((addressID) => ({
          id1: addressID,
          id2: transferID,
        })),
    ),
  );

  const seen = new Set<string>();
  const data = _.flatMap(
    _.sortBy(transactions, ({ transactionIndex }) => -transactionIndex),
    ({ addressIDs, transactionID, transactionHash }) => {
      const filtered = Object.keys(addressIDs).filter((addressID) => !seen.has(addressID));
      filtered.forEach((addressID) => {
        seen.add(addressID);
      });

      return filtered.map<[string, AddressData]>((addressID) => [
        addressID,
        {
          transactionCount: getValue<number>(addressID, addressTransactionCounts, 0),
          transferCount: getValue<number>(addressID, addressTransferCounts, 0),
          transactionID,
          transactionHash,
        },
      ]);
    },
  );

  return _.fromPairs(data);
};

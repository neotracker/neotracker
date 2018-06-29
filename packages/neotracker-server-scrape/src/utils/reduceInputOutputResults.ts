import { InputOutputResult } from '../types';
import { reduceCoinChanges } from './reduceCoinChanges';

export const EMPTY_INPUT_OUTPUT_RESULT: InputOutputResult = {
  assetIDs: [],
  addressIDs: {},
};

interface InputOutputResultAddressIDsReadbleValue {
  readonly startTransactionID: string;
  readonly startTransactionHash: string;
  readonly startTransactionIndex: number;
}

interface InputOutputResultAddressIDsReadable {
  // tslint:disable-next-line readonly-keyword
  [addressID: string]: InputOutputResultAddressIDsReadbleValue;
}

export const reduceInputOutputResults = (results: ReadonlyArray<InputOutputResult>): InputOutputResult =>
  results.reduce(
    (acc, result) => ({
      assetIDs: acc.assetIDs.concat(result.assetIDs),
      addressIDs: Object.entries(acc.addressIDs)
        .concat(Object.entries(result.addressIDs))
        .reduce<InputOutputResultAddressIDsReadable>((innerAcc, [addressID, addressData]) => {
          const address = innerAcc[addressID] as InputOutputResultAddressIDsReadbleValue | undefined;
          if (address === undefined || address.startTransactionIndex > addressData.startTransactionIndex) {
            // tslint:disable-next-line no-object-mutation
            innerAcc[addressID] = addressData;
          }

          return innerAcc;
        }, {}),
      coinChanges: reduceCoinChanges(acc.coinChanges, result.coinChanges),
    }),
    EMPTY_INPUT_OUTPUT_RESULT,
  );

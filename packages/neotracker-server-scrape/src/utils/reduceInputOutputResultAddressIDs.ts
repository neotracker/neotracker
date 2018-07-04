import { InputOutputResultAddressIDs } from '../types';

const EMPTY_ADDRESS_IDS: InputOutputResultAddressIDs = {};

interface InputOutputResultAddressIDsReadableValue {
  readonly startTransactionID: string;
  readonly startTransactionHash: string;
  readonly startTransactionIndex: number;
}

interface InputOutputResultAddressIDsReadable {
  // tslint:disable-next-line readonly-keyword
  [addressID: string]: InputOutputResultAddressIDsReadableValue;
}

export const reduceInputOutputResultAddressIDs = (
  addressIDs: ReadonlyArray<InputOutputResultAddressIDs>,
): InputOutputResultAddressIDs =>
  addressIDs.reduce(
    (acc, result) =>
      Object.entries(acc)
        .concat(Object.entries(result))
        .reduce<InputOutputResultAddressIDsReadable>((innerAcc, [addressID, addressData]) => {
          const address = innerAcc[addressID] as InputOutputResultAddressIDsReadableValue | undefined;
          if (address === undefined || address.startTransactionIndex > addressData.startTransactionIndex) {
            // tslint:disable-next-line no-object-mutation
            innerAcc[addressID] = addressData;
          }

          return innerAcc;
        }, {}),
    EMPTY_ADDRESS_IDS,
  );

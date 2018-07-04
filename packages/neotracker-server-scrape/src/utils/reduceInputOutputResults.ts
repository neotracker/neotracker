import { InputOutputResult } from '../types';
import { reduceCoinChanges } from './reduceCoinChanges';
import { reduceInputOutputResultAddressIDs } from './reduceInputOutputResultAddressIDs';

export const EMPTY_INPUT_OUTPUT_RESULT: InputOutputResult = {
  assetIDs: [],
  addressIDs: {},
};

export const reduceInputOutputResults = (results: ReadonlyArray<InputOutputResult>): InputOutputResult =>
  results.reduce(
    (acc, result) => ({
      assetIDs: acc.assetIDs.concat(result.assetIDs),
      addressIDs: reduceInputOutputResultAddressIDs([acc.addressIDs, result.addressIDs]),
      coinChanges: reduceCoinChanges(acc.coinChanges, result.coinChanges),
    }),
    EMPTY_INPUT_OUTPUT_RESULT,
  );

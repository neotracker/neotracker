/* @flow */
import normalizeRelayPayload from 'relay-runtime/lib/normalizeRelayPayload';

import RelayError from 'relay-runtime/lib/RelayError';

import { ROOT_ID } from 'relay-runtime/lib/RelayStoreUtils';

export default function normalizePayload(payload: any): any {
  const { operation, variables, response } = payload;
  const { data, errors } = response;
  if (data != null) {
    return normalizeRelayPayload(
      {
        dataID: ROOT_ID,
        node: operation,
        variables,
      },
      data,
      errors,
      { handleStrippedNulls: false },
    );
  }
  const error = RelayError.create(
    'RelayNetwork',
    'No data returned for operation `%s`, got error(s):\n%s\n\nSee the error ' +
      '`source` property for more information.',
    operation.name,
    errors ? errors.map(({ message }) => message).join('\n') : '(No errors)',
  );
  (error: any).source = { errors, operation, variables };
  throw error;
}

import { addressToScriptHash, RawAction } from '@neo-one/client-full';
import { utils } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import { ActionData, Context } from '../types';
import { strip0x } from './strip0x';

export function getActionDataForClient({
  context,
  action: actionIn,
}: {
  readonly context: Context;
  readonly action: RawAction;
}): ActionData<RawAction> {
  const nep5Contract = context.nep5Contracts[strip0x(addressToScriptHash(actionIn.address))];
  if (nep5Contract === undefined) {
    return { action: actionIn };
  }
  // tslint:disable-next-line no-any
  let action: any;
  try {
    action = nep5Contract.convertAction(actionIn);
  } catch {
    // ignore errors
  }
  if (action === undefined || action.type !== 'Event' || action.name !== 'transfer') {
    return { action: actionIn };
  }

  const parameters = action.parameters;

  let fromAddressHash = parameters.from === undefined ? undefined : parameters.from;
  const toAddressHash = parameters.to === undefined ? undefined : parameters.to;
  const value = parameters.amount as BigNumber;
  if (actionIn.address === fromAddressHash) {
    fromAddressHash = undefined;
  }

  const result = {
    fromAddressID: fromAddressHash,
    toAddressID: toAddressHash,
    assetID: strip0x(addressToScriptHash(actionIn.address)),
    transferID: actionIn.globalIndex.toString(),
    coinChanges: [
      fromAddressHash === undefined
        ? undefined
        : {
            address: fromAddressHash,
            asset: strip0x(addressToScriptHash(actionIn.address)),
            value: value.negated(),
          },
      toAddressHash === undefined
        ? undefined
        : {
            address: toAddressHash,
            asset: strip0x(addressToScriptHash(actionIn.address)),
            value,
          },
    ].filter(utils.notNull),
  };

  return { action: actionIn, transfer: { value, result } };
}

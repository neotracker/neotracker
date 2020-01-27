/* @flow */
import type BigNumber from 'bignumber.js';
import type { UserAccountID } from '@neo-one/client-common';

import { createAction, handleActions } from 'redux-actions';

import { type AssetType } from '../wallet';

export type State = {
  confirmTransaction: ?{
    account: UserAccountID,
    amount: BigNumber,
    asset: {
      type: AssetType,
      id: string,
      name: $ReadOnlyArray<{
        name: string,
        lang: string,
      }>,
    },
  },
};

export const confirmTransaction = createAction('wallet/confirmTransaction');
export const clearConfirmTransaction = createAction(
  'wallet/clearConfirmTransaction',
);

export default handleActions(
  {
    [confirmTransaction]: (state: State, { payload }): State => ({
      ...state,
      confirmTransaction: payload,
    }),
    [clearConfirmTransaction]: (state: State): State => ({
      ...state,
      confirmTransaction: null,
    }),
  },
  {
    confirmTransaction: null,
  },
);

export const selectConfirmTransaction = (state: State) =>
  state.confirmTransaction;

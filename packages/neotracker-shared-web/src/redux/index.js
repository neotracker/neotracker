/* @flow */
import { createSelector } from 'reselect';

import claimReducer, {
  selectClaiming as _selectClaiming,
  selectClaimProgress as _selectClaimProgress,
  selectClaimError as _selectClaimError,
  selectClaimSpendConfirmHash as _selectClaimSpendConfirmHash,
  selectClaimClaimConfirmHash as _selectClaimClaimConfirmHash,
  type State as ClaimState,
} from './claim';
import snackbarReducer, {
  selectSnackbarProps as _selectSnackbarProps,
  type State as SnackbarState,
} from './snackbar';
import timerReducer, {
  selectTimerState as _selectTimerState,
  type State as TimerState,
} from './timer';
import walletReducer, {
  selectConfirmTransaction as _selectConfirmTransaction,
  type State as WalletState,
} from './wallet';

export type { SnackbarProps } from './snackbar';

export { startClaiming, endClaiming, claimProgress, claimError } from './claim';
export { clearSnackbar, setSnackbar } from './snackbar';
export { flip } from './timer';
export { confirmTransaction, clearConfirmTransaction } from './wallet';

type State = {
  claim: ClaimState,
  snackbar: SnackbarState,
  timer: TimerState,
  wallet: WalletState,
};

const selectClaim = (state: State) => state.claim;
export const selectClaiming = createSelector(
  selectClaim,
  _selectClaiming,
);
export const selectClaimProgress = createSelector(
  selectClaim,
  _selectClaimProgress,
);
export const selectClaimError = createSelector(
  selectClaim,
  _selectClaimError,
);
export const selectClaimSpendConfirmHash = createSelector(
  selectClaim,
  _selectClaimSpendConfirmHash,
);
export const selectClaimClaimConfirmHash = createSelector(
  selectClaim,
  _selectClaimClaimConfirmHash,
);

const selectSnackbar = (state: State) => state.snackbar;
export const selectSnackbarProps = createSelector(
  selectSnackbar,
  _selectSnackbarProps,
);

const selectTimer = (state: State) => state.timer;
export const selectTimerState = createSelector(
  selectTimer,
  _selectTimerState,
);

const selectWallet = (state: State) => state.wallet;
export const selectConfirmTransaction = createSelector(
  selectWallet,
  _selectConfirmTransaction,
);

export default () => ({
  claim: claimReducer,
  snackbar: snackbarReducer,
  timer: timerReducer,
  wallet: walletReducer,
});

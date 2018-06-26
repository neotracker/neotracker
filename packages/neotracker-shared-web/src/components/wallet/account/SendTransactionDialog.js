/* @flow */
import BigNumber from 'bignumber.js';
// $FlowFixMe
import { ClientError } from 'neotracker-shared-utils';
import * as React from 'react';
import type { UserAccount } from '@neo-one/client';

import {
  type HOC,
  compose,
  getContext,
  lifecycle,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import { connect } from 'react-redux';

import type { AppContext } from '../../../AppContext';
import { type Theme } from '../../../styles/createTheme';
import { AddressLink, CoinValue } from '../../explorer/address/lib';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  withStyles,
} from '../../../lib/base';
import { TransactionLink } from '../../explorer/transaction/lib';

import {
  clearConfirmTransaction,
  selectConfirmTransaction,
} from '../../../redux';
import { api as walletAPI } from '../../../wallet';
import { getName } from '../../explorer/asset/lib';
import { getID } from '../../../graphql/relay';

const styles = (theme: Theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  inline: {
    display: 'inline-block',
  },
  confirmText: {
    paddingTop: theme.spacing.unit,
  },
  progress: {
    minWidth: 32,
    width: 32,
  },
});

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  confirmTransaction: ?{
    account: UserAccount,
    address: string,
    amount: string,
    asset: {
      id: string,
      symbol: string,
    },
  },
  open: boolean,
  loading: boolean,
  confirmed: boolean,
  hash: ?string,
  error: ?string,
  onClose: () => void,
  onCancel: () => void,
  onConfirm: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SendTransactionDialog({
  className,
  confirmTransaction: confirmTransactionIn,
  open,
  loading,
  confirmed,
  hash,
  error,
  onClose,
  onCancel,
  onConfirm,
  classes,
}: Props): React.Element<*> {
  const cancel = (
    <Button onClick={onCancel} disabled={loading} color="primary">
      <Typography color="inherit" variant="body1">
        CANCEL
      </Typography>
    </Button>
  );
  let content;
  let actions = (
    <DialogActions>
      {loading ? (
        <CircularProgress
          className={classes.progress}
          size={32}
          thickness={5}
        />
      ) : (
        <span />
      )}
      {cancel}
      <Button onClick={onConfirm} disabled={loading} color="primary">
        <Typography color="inherit" variant="body1">
          CONFIRM
        </Typography>
      </Button>
    </DialogActions>
  );
  if (confirmTransactionIn != null) {
    const confirmTransaction = confirmTransactionIn;
    const makeText = (prelude) => (
      <Typography>
        {prelude}
        <CoinValue
          className={classes.inline}
          variant="body2"
          component="span"
          value={confirmTransaction.amount}
        />{' '}
        <Typography className={classes.inline} variant="body2" component="span">
          {getName(
            confirmTransaction.asset.symbol,
            getID(confirmTransaction.asset.id),
          )}
        </Typography>
        {' to address: '}
        <AddressLink
          addressHash={confirmTransaction.address}
          newTab
          component="span"
        />
      </Typography>
    );

    if (confirmed && hash != null) {
      content = (
        <div className={classes.content}>
          {makeText('Transfer initiated to send ')}
          <Typography variant="body1">
            {'Transactions typically take up to one minute to confirm and ' +
              'appear on the explorer: '}
          </Typography>
          <TransactionLink transactionHash={hash} newTab />
        </div>
      );
      actions = (
        <DialogActions>
          <Button onClick={onClose} color="primary">
            <Typography color="inherit" variant="body1">
              CLOSE
            </Typography>
          </Button>
        </DialogActions>
      );
    } else if (confirmed && error != null) {
      content = (
        <div className={classes.content}>
          {makeText('Transfer failed to send ')}
          <Typography variant="body1">{`Error: ${error}`}</Typography>
        </div>
      );
      actions = (
        <DialogActions>
          {cancel}
          <Button onClick={onConfirm} color="primary">
            <Typography color="inherit" variant="body1">
              RETRY
            </Typography>
          </Button>
        </DialogActions>
      );
    } else if (loading) {
      content = (
        <div className={classes.content}>
          {makeText('Initiating transfer to send ')}
        </div>
      );
    } else {
      content = (
        <div className={classes.content}>
          {makeText('You are about to send ')}
          <Typography
            className={classes.confirmText}
            variant="title"
            component="span"
          >
            Are you sure you want to do this?
          </Typography>
        </div>
      );
    }
  }

  return (
    <Dialog
      className={className}
      maxWidth="sm"
      disableBackdropClick={!confirmed}
      disableEscapeKeyDown={!confirmed}
      open={confirmTransactionIn != null && open}
      onClose={onClose}
    >
      <DialogTitle>Confirm Transfer</DialogTitle>
      <DialogContent>{content}</DialogContent>
      {actions}
    </Dialog>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  connect(
    (state) => ({
      confirmTransaction: selectConfirmTransaction(state),
    }),
    (dispatch) => ({ dispatch }),
  ),
  withStateHandlers(
    () => ({
      open: false,
      loading: false,
      confirmed: false,
      hash: null,
      error: null,
      timer: null,
    }),
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  withHandlers({
    onClose: ({ dispatch, setState }) => () => {
      setState((prevState) => ({
        ...prevState,
        open: false,
        timer: setTimeout(() => {
          dispatch(clearConfirmTransaction());
          setState((prevStateInner) => ({
            ...prevStateInner,
            loading: false,
            confirmed: false,
            hash: null,
            error: null,
          }));
        }, 1000),
      }));
    },
  }),
  withHandlers({
    onCancel: ({ appContext: appContextIn, onClose }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      onClose();
      appContext.monitor.log({
        name: 'neotracker_wallet_send_transaction_cancel',
        level: 'verbose',
      });
    },
    onConfirm: ({
      confirmTransaction,
      setState,
      appContext: appContextIn,
    }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      setState((prevState) => ({
        ...prevState,
        loading: true,
        confirmed: false,
        hash: null,
        error: null,
      }));
      appContext.monitor
        .captureLog(
          () =>
            walletAPI.doSendAsset({
              appContext,
              account: confirmTransaction.account.id,
              toAddress: confirmTransaction.address,
              amount: new BigNumber(confirmTransaction.amount),
              assetType: confirmTransaction.asset.type,
              assetHash: getID(confirmTransaction.asset.id),
            }),
          {
            name: 'neotracker_wallet_send_transaction',
            level: 'verbose',
            error: {},
          },
        )
        .then((hash) => {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            confirmed: true,
            hash,
            error: null,
          }));
        })
        .catch((error) => {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            confirmed: true,
            hash: null,
            error:
              error instanceof ClientError
                ? error.clientMessage
                : 'Unknown error.',
          }));
        });
    },
  }),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      if (
        this.props.confirmTransaction !== nextProps.confirmTransaction &&
        nextProps.confirmTransaction != null
      ) {
        if (nextProps.timer != null) {
          clearTimeout(nextProps.timer);
        }
        nextProps.setState((prevState) => ({
          ...prevState,
          open: true,
          loading: false,
          confirmed: false,
          hash: null,
          error: null,
        }));
      }
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(SendTransactionDialog): React.ComponentType<
  ExternalProps,
>);

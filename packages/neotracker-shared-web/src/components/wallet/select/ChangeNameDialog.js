/* @flow */
import {
  type HOC,
  compose,
  getContext,
  lifecycle,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import * as React from 'react';
import type { UserAccount } from '@neo-one/client-common';

// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
import type { AppContext } from '../../../AppContext';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  withStyles,
} from '../../../lib/base';
import { type Theme } from '../../../styles/createTheme';

import { addShowSnackbarError } from '../../../utils';
import { api as walletAPI } from '../../../wallet';

const styles = (theme: Theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  changeNameField: {
    marginTop: theme.spacing.unit * 2,
  },
});

export const CHANGE_NAME_TEXT =
  'Change the name of this wallet. Wallet name is an alias stored ' +
  'local to your computer to make it easier to manage multiple ' +
  'wallets.';

type ExternalProps = {|
  account: UserAccount,
  open: boolean,
  onClose: () => void,
  className?: string,
|};
type InternalProps = {|
  name: string,
  validation: ?string,
  onChange: (event: Object) => void,
  onConfirm: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ChangeNameDialog({
  open,
  onClose,
  className,
  name,
  validation,
  onChange,
  onConfirm,
  classes,
}: Props): React.Element<*> {
  const disabled = validation != null;
  return (
    <Dialog className={className} maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Change Wallet Name</DialogTitle>
      <DialogContent>
        <div className={classes.content}>
          <Typography variant="body1">{CHANGE_NAME_TEXT}</Typography>
          <TextField
            id="change-name"
            className={classes.changeNameField}
            value={name}
            error={validation != null}
            subtext={validation}
            maxCharacters={walletAPI.MAX_NAME_CHARACTERS}
            hasSubtext
            label="Wallet Name"
            onChange={onChange}
            onEnter={disabled ? undefined : onConfirm}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          <Typography color="inherit" variant="body1">
            CANCEL
          </Typography>
        </Button>
        <Button disabled={disabled} onClick={onConfirm} color="primary">
          <Typography color="inherit" variant="body1">
            CONFIRM
          </Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  addShowSnackbarError,
  withStateHandlers(
    ({ account }) => ({
      name: account.name,
      validation: (null: ?string),
    }),
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  withHandlers({
    onChangeName: ({ setState }) => (name) => {
      let validation;
      try {
        walletAPI.validateName(name);
      } catch (error) {
        validation = sanitizeError(error).clientMessage;
      }

      setState((prevState) => ({
        ...prevState,
        name,
        validation,
      }));
    },
  }),
  withHandlers({
    onChange: ({ onChangeName }) => (event) => {
      onChangeName(event.target.value);
    },
    onConfirm: (options) => () => {
      const {
        account,
        name,
        appContext,
        onClose,
        showSnackbarError,
      } = ((options: $FlowFixMe): {|
        account: UserAccount,
        name: string,
        appContext: AppContext,
        onClose: () => void,
        showSnackbarError: (error: Error) => void,
      |});
      webLogger.info({ title: 'neotracker_wallet_change_name' });
      walletAPI
        .updateName({ appContext, id: account.id, name })
        .then(() => onClose())
        .catch((error) => {
          webLogger.error({
            title: 'neotracker_wallet_change_name',
            error: error.message,
          });
          throw error;
        })
        .catch((error) => {
          showSnackbarError(error);
        });
    },
  }),
  withStyles(styles),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      if (this.props.account !== nextProps.account) {
        nextProps.onChangeName(nextProps.account.name);
      }
    },
  }),
  pure,
);

export default (enhance(ChangeNameDialog): React.ComponentType<ExternalProps>);

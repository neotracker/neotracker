/* @flow */
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';
import {
  type HOC,
  compose,
  pure,
  getContext,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import * as React from 'react';

import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import {
  Button,
  CircularProgress,
  Typography,
  withStyles,
} from '../../../lib/base';
import { PasswordField } from '../common';
import { type Theme } from '../../../styles/createTheme';
import unlockWallet from './unlockWallet';
import type { AppContext } from '../../../AppContext';

import * as routes from '../../../routes';

const styles = (theme: Theme) => ({
  root: {
    flex: '1 1 auto',
    maxWidth: theme.spacing.unit * 70,
  },
  passwordArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  passwordField: {
    flex: '1 1 auto',
  },
  unlockArea: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  unlockButton: {
    marginLeft: theme.spacing.unit,
  },
});

type ExternalProps = {|
  onOpen: () => void,
  onOpenError: (error: Error) => void,
  keyElement: React.Element<any>,
  selectAccountElement?: React.Element<any>,
  hiddenUsernameElement?: React.Element<any>,
  className?: string,
  accessType: string,
  wallet: ?mixed,
|};
type InternalProps = {|
  loading: boolean,
  password: string,
  validation?: string,
  onChange: (event: Object) => void,
  onSubmit: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function OpenWalletPassword({
  className,
  wallet,
  loading,
  password,
  validation,
  onChange,
  onSubmit,
  keyElement,
  selectAccountElement,
  hiddenUsernameElement,
  classes,
}: Props): React.Element<*> {
  let passwordElement;
  if (wallet != null) {
    passwordElement = (
      <div className={classes.passwordArea}>
        <PasswordField
          id="owfp-password"
          autoComplete="current-password"
          className={classes.passwordField}
          value={password}
          validation={validation}
          onChange={onChange}
          onEnter={onSubmit}
          label="Enter password."
          hasSubtext
        />
        <div className={classes.unlockArea}>
          {loading ? <CircularProgress size={32} /> : null}
          <Button
            className={classes.unlockButton}
            color="primary"
            disabled={validation != null || loading}
            onClick={onSubmit}
          >
            <Typography color="inherit" variant="body1">
              UNLOCK
            </Typography>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={classNames(className, classes.root)}>
      {keyElement}
      {hiddenUsernameElement}
      {selectAccountElement}
      {passwordElement}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  withStateHandlers(
    () => ({
      password: '',
      validation: undefined,
      loading: false,
    }),
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  withRouter,
  withHandlers({
    onChange: ({ setState }) => (event) => {
      const password = event.target.value;
      setState((prevState) => ({ ...prevState, password, validation: null }));
    },
    onSubmit: ({
      setState,
      wallet,
      password,
      history,
      accessType,
      appContext: appContextIn,
      onOpen,
      onOpenError,
    }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);

      setState((prevState) => ({
        ...prevState,
        loading: true,
      }));

      unlockWallet({ appContext, wallet: { ...wallet, password } })
        .then(() => {
          history.replace(routes.WALLET_HOME);
          onOpen();
        })
        .catch((error) => {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            validation:
              `Open ${accessType} failed: ` +
              `${sanitizeError(error).clientMessage}`,
          }));
          onOpenError(error);
        });
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  OpenWalletPassword,
): React.ComponentType<ExternalProps>);

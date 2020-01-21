/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { encryptNEP2 } from '@neo-one/client-common';
import {
  type HOC,
  compose,
  getContext,
  pure,
  withHandlers,
  withProps,
  withState,
} from 'recompose';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import { type Theme } from '../../../styles/createTheme';
import {
  Button,
  CircularProgress,
  Typography,
  withStyles,
} from '../../../lib/base';
import { PasswordField } from '../common';

import { validatePassword } from '../../../utils';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    content: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    content: {
      padding: theme.spacing.unit * 2,
    },
  },
  content: {},
  passwordField: {
    flex: '1 1 auto',
    marginRight: theme.spacing.unit,
    maxWidth: theme.spacing.unit * 50,
    paddingTop: theme.spacing.unit * 2,
  },
  bold: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  footer: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.custom.lightDivider}`,
  },
  createButton: {
    marginLeft: theme.spacing.unit,
  },
  error: {
    color: theme.palette.error[500],
  },
});

const WARNING_TEXT =
  'This password encrypts your private key. This does not act as a seed to ' +
  'generate your keys.';
const BOLD_WARNING_TEXT =
  'You will need this password and your private key to unlock your wallet.';

type ExternalProps = {|
  privateKey: string,
  onCreate: (password: string, nep2: string) => void,
  className?: string,
|};
type InternalProps = {|
  password: string,
  loading: boolean,
  error: ?string,
  onChange: (event: Object) => void,
  onSubmit: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function CreateKeystoreView({
  className,
  loading,
  password,
  error,
  onChange,
  onSubmit,
  classes,
}: Props): React.Element<*> {
  const validation = validatePassword(password);
  return (
    <div className={className}>
      <div className={classes.content}>
        <Typography variant="body1">{WARNING_TEXT}</Typography>
        <Typography className={classes.bold} variant="body1">
          {BOLD_WARNING_TEXT}
        </Typography>
        <PasswordField
          id="ckv-password"
          className={classes.passwordField}
          value={password}
          validation={validation}
          hasSubtext
          onChange={onChange}
          onEnter={onSubmit}
          label="Enter Password"
        />
      </div>
      <div className={classNames(classes.footer, classes.content)}>
        {error == null ? null : (
          <Typography className={classes.error} variant="body1">
            {error}
          </Typography>
        )}
        {loading ? <CircularProgress size={32} thickness={5} /> : null}
        <Button
          className={classes.createButton}
          color="primary"
          disabled={validation != null || loading}
          onClick={onSubmit}
        >
          <Typography color="inherit" variant="body1">
            CREATE
          </Typography>
        </Button>
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  withState('state', 'setState', () => ({
    password: '',
    loading: false,
    error: null,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onChange: ({ setState }) => (event) => {
      const password = event.target.value;
      setState((prevState) => ({ ...prevState, password, error: null }));
    },
    onSubmit: ({ privateKey, password, onCreate, setState }) => () => {
      setState((prevState) => ({
        ...prevState,
        loading: true,
        error: null,
      }));
      webLogger.info({ title: 'neotracker_wallet_create_keystore' });
      encryptNEP2({ password, privateKey })
        .then((nep2) => {
          setState((prevState) => ({
            ...prevState,
            loading: false,
          }));
          onCreate(password, nep2);
        })
        .catch((error) => {
          webLogger.error({ title: 'neotracker_wallet_create_keystore' });
          setState((prevState) => ({
            ...prevState,
            loading: false,
            error: `Keystore creation failed: ${
              sanitizeError(error).clientMessage
            }`,
          }));
        });
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  CreateKeystoreView,
): React.ComponentType<ExternalProps>);

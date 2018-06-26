/* @flow */
import {
  type HOC,
  compose,
  getContext,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import * as React from 'react';

import classNames from 'classnames';

import { privateKeyToAddress, wifToPrivateKey } from '@neo-one/client';

import type { AppContext } from '../../../AppContext';
import Button from '../../../lib/base/Button';
import Typography from '../../../lib/base/Typography';
import PasswordField from '../common/PasswordField';
import OpenWalletPassword from './OpenWalletPassword';
// eslint-disable-next-line
import OpenWalletPrivateKey from './OpenWalletPrivateKey';
import { withStyles } from '../../../lib/base';
import { type Theme } from '../../../styles/createTheme';

import { api as walletAPI } from '../../../wallet';

const styles = (theme: Theme) => ({
  root: {
    flex: '1 1 auto',
    maxWidth: theme.spacing.unit * 70,
  },
  submitArea: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  passwordArea: {
    display: 'flex',
    flexDirection: 'column',
  },
});

type ExternalProps = {|
  className?: string,
  initialNEP2Key?: string,
|};
type InternalProps = {|
  wallet: ?mixed,
  nep2Key: string,
  password: string,
  error?: string,
  onChangeNEP2: (event: Object) => void,
  onSubmit: () => void,
  onOpen: () => void,
  onOpenError: (error: Error) => void,
  privateKey?: string,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function OpenWalletEncryptedKey({
  nep2Key,
  wallet,
  error,
  onChangeNEP2,
  onOpen,
  onSubmit,
  onOpenError,
  privateKey,
  classes,
  className,
}: Props): React.Element<*> {
  const encryptedKeyElement = (
    <div className={classes.passwordArea}>
      <PasswordField
        id="owek-encrypted-key"
        value={nep2Key}
        validation={error}
        hasSubtext
        onChange={onChangeNEP2}
        onEnter={onSubmit}
        error={error != null}
        label="Paste or type encrypted key."
      />
      <div className={classes.submitArea}>
        <Button color="primary" disabled={error != null} onClick={onSubmit}>
          <Typography color="inherit" variant="body1">
            CONTINUE
          </Typography>
        </Button>
      </div>
    </div>
  );
  if (privateKey != null) {
    return (
      <OpenWalletPrivateKey
        className={className}
        initialPrivateKey={privateKey}
      />
    );
  }
  return (
    <OpenWalletPassword
      className={classNames(className, classes.root)}
      accessType="Encrypted Key"
      keyElement={encryptedKeyElement}
      onOpen={onOpen}
      onOpenError={onOpenError}
      wallet={wallet}
    />
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  withStateHandlers(
    ({ initialNEP2Key }) => {
      if (initialNEP2Key == null) {
        return {
          error: undefined,
          nep2Key: '',
          privateKey: undefined,
          wallet: undefined,
        };
      }
      return {
        error: undefined,
        nep2Key: initialNEP2Key,
        privateKey: undefined,
        wallet: { type: 'nep2', wallet: initialNEP2Key },
      };
    },
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  withHandlers({
    onChangeNEP2: ({ setState }) => (event) => {
      const nep2Key = event.target.value;
      let privateKeyCheck;
      try {
        privateKeyCheck = wifToPrivateKey(nep2Key);
      } catch (error) {
        // do nothing;
      }
      if (privateKeyCheck == null) {
        try {
          privateKeyCheck = privateKeyToAddress(nep2Key);
        } catch (error) {
          // do nothing
        }
      }
      if (privateKeyCheck != null) {
        setState((prevState) => ({
          ...prevState,
          privateKey: nep2Key,
          error: undefined,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          nep2Key,
          wallet: undefined,
          error: undefined,
        }));
      }
    },
    onSubmit: ({ setState, nep2Key }) => () => {
      if (walletAPI.isNEP2(nep2Key)) {
        setState((prevState) => ({
          ...prevState,
          nep2Key,
          wallet: { type: 'nep2', wallet: nep2Key },
          error: undefined,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          nep2Key,
          wallet: undefined,
          error:
            'Invalid Encrypted Key. A valid NEP-2 Encrypted Key looks like ' +
            '6PYTp4fNNhn2oV6HZhjzfg6YoeC8r1wWsCPikEJXxcTmsitDm92mWpdqd6',
        }));
      }
    },
    onOpen: ({ appContext: appContextIn }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor.log({
        name: 'neotracker_wallet_open_encrypted_key',
        level: 'verbose',
        error: {},
      });
    },
    onOpenError: ({ appContext: appContextIn }) => (error) => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor.log({
        name: 'neotracker_wallet_open_encrypted_key',
        level: 'verbose',
        error: { error },
      });
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(OpenWalletEncryptedKey): React.ComponentType<
  ExternalProps,
>);

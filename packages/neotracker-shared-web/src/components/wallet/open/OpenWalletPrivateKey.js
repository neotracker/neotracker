/* @flow */
import {
  type HOC,
  compose,
  getContext,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import { Link } from 'react-router-dom';
import * as React from 'react';

import classNames from 'classnames';
import { privateKeyToAddress, wifToPrivateKey } from '@neo-one/client-common';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import type { AppContext } from '../../../AppContext';
// eslint-disable-next-line
import OpenWalletEncryptedKey from './OpenWalletEncryptedKey';
import { Button, Typography, withStyles } from '../../../lib/base';
import { type Theme } from '../../../styles/createTheme';
import { GenerateKeystore } from '../keystore';
import { PasswordField } from '../common';

import { api as walletAPI } from '../../../wallet';
import * as routes from '../../../routes';

const styles = (theme: Theme) => ({
  root: {
    flex: '1 1 auto',
    maxWidth: theme.spacing.unit * 70,
  },
  submitArea: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  link: {
    textDecoration: 'none',
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
  generateKeystore: {
    marginRight: theme.spacing.unit,
  },
  unlockedArea: {
    marginTop: theme.spacing.unit,
  },
});

type ExternalProps = {|
  className?: string,
  initialPrivateKey?: string,
|};
type InternalProps = {|
  privateKey: string,
  unlocked: boolean,
  error?: string,
  nep2Key?: string,
  onChange: (event: Object) => void,
  onSubmit: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function OpenWalletPrivateKey({
  className,
  privateKey,
  unlocked,
  error,
  onChange,
  onSubmit,
  nep2Key,
  classes,
}: Props): React.Element<*> {
  let setup;
  if (unlocked) {
    setup = (
      <div className={classNames(classes.submitArea, classes.unlockedArea)}>
        <GenerateKeystore className={classes.generateKeystore} replace />
        <Link className={classes.link} replace to={routes.WALLET_HOME}>
          <Button variant="contained" color="primary">
            <Typography className={classes.buttonText} variant="body1">
              GO TO WALLET
            </Typography>
          </Button>
        </Link>
      </div>
    );
  }
  if (nep2Key != null) {
    return (
      <OpenWalletEncryptedKey className={className} initialNEP2Key={nep2Key} />
    );
  }
  return (
    <div className={classNames(classes.root, className)}>
      <PasswordField
        id="owpk-private-key"
        value={privateKey}
        validation={error}
        hasSubtext
        onChange={onChange}
        onEnter={onSubmit}
        readOnly={unlocked}
        label="Paste or type private key."
      />
      <div className={classes.submitArea}>
        <Button
          color="primary"
          disabled={error != null && !unlocked}
          onClick={onSubmit}
        >
          <Typography color="inherit" variant="body1">
            UNLOCK
          </Typography>
        </Button>
      </div>
      {setup}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  withStateHandlers(
    ({ initialPrivateKey }) => {
      if (initialPrivateKey == null) {
        return {
          unlocked: false,
          privateKey: '',
          nep2Key: undefined,
          error: undefined,
        };
      }
      return {
        unlocked: false,
        privateKey: initialPrivateKey,
        nep2Key: undefined,
        error: undefined,
      };
    },
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  withHandlers({
    onChange: ({ setState }) => (event) => {
      const privateKey = event.target.value;
      setState((prevState) => ({
        ...prevState,
        privateKey,
        error: undefined,
      }));
    },
    onSubmit: ({
      setState,
      privateKey: privateKeyIn,
      appContext: appContextIn,
    }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      const logError = (error: Error) => {
        webLogger.error({
          title: 'neotracker_wallet_open_private_key_error',
          error: error.message,
        });
      };

      const onError = (errorMessage: string) => {
        setState((prevState) => ({
          ...prevState,
          error:
            `${errorMessage} A valid WIF Private Key looks like ` +
            `L4afVEGodWqHnuMfAaw2HegcLgnQqG7D38rWC1UET7cicoNeJoZZ.`,
        }));
      };
      const privateKeyTrimmed = privateKeyIn.trim();
      if (walletAPI.isNEP2(privateKeyTrimmed)) {
        setState((prevState) => ({
          ...prevState,
          nep2Key: privateKeyTrimmed,
          error: undefined,
        }));
        return;
      }

      let privateKey;
      let errorMessage;
      try {
        privateKey = wifToPrivateKey(privateKeyTrimmed);
      } catch (error) {
        logError(error);
        errorMessage = sanitizeError(error).clientMessage;
      }

      if (privateKey == null) {
        try {
          privateKeyToAddress(privateKeyTrimmed);
          privateKey = privateKeyTrimmed;
        } catch (error) {
          logError(error);
        }
      }

      if (privateKey == null) {
        if (errorMessage == null) {
          throw new Error('For Flow');
        }
        onError(errorMessage);
        return;
      }

      walletAPI
        .addPrivateKeyAccount({
          appContext,
          privateKey,
        })
        .then(() => {
          setState((prevState) => ({
            ...prevState,
            unlocked: true,
          }));
        })
        .catch((error) => {
          logError(error);
          onError(sanitizeError(error).clientMessage);
        });
      webLogger.info({ title: 'neotracker_wallet_open_private_key' });
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  OpenWalletPrivateKey,
): React.ComponentType<ExternalProps>);

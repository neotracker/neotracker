/* @flow */
import * as React from 'react';
import {
  type LocalWallet,
  type UserAccount,
  privateKeyToWIF,
} from '@neo-one/client';

import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Typography, withStyles } from '../../../lib/base';
import { CopyField, PasswordField } from '../common';
import { PrintPaperWalletButton } from '../paper';
import { SaveOrGenerateKeystore } from '../keystore';

import InfoLabeled from './InfoLabeled';

const styles = (theme: Theme) => ({
  marginTop: {
    marginTop: theme.spacing.unit,
  },
  textField: {
    maxWidth: theme.spacing.unit * 70,
  },
  unlockText: {
    marginLeft: theme.spacing.unit * 4,
    marginTop: theme.spacing.unit * 2,
  },
});

const ADDRESS_TOOLTIP =
  'Your Address can also be known as you Account # or your Public Key. ' +
  'It is what you share with people so they can send you NEO, GAS or other tokens. ' +
  'Make sure it matches your paper wallet & whenever you enter your ' +
  'address somewhere.';
const KEYSTORE_TOOLTIP =
  'Your Keystore file stores your Private Key in an encrypted format using ' +
  'a password. It is recommended to always use the Keystore file to unlock ' +
  'your wallet.';
const PRIVATE_KEY_TOOLTIP =
  'This is the unencrypted text version of your private key, meaning no ' +
  'password is necessary. If someone were to find your unencrypted private ' +
  'key, they could access your wallet without a password. For this reason, ' +
  'encrypted versions such as the Keystore are typically recommended';
const PAPER_WALLET_TOOLTIP =
  'A paper wallet is a form of cold storage. Simply print it out and keep it ' +
  'somewhere safe.';

type ExternalProps = {|
  account: ?UserAccount,
  wallet: ?LocalWallet,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function InfoView({
  account,
  wallet,
  className,
  classes,
}: Props): React.Element<*> {
  let content = (
    <Typography variant="body1">
      Open or create a wallet to view wallet details.
    </Typography>
  );
  if (account != null) {
    const address = (
      <InfoLabeled
        key="address"
        label="Your Address"
        tooltip={ADDRESS_TOOLTIP}
        element={
          <CopyField
            id="iv-address"
            className={classes.textField}
            value={account.id.address}
            name="Address"
          />
        }
      />
    );
    if (wallet != null) {
      if (wallet.type === 'locked') {
        content = [
          address,
          <Typography
            key="unlock"
            className={classes.unlockText}
            variant="body1"
          >
            Unlock your wallet to see more wallet details.
          </Typography>,
        ];
      } else {
        content = [
          address,
          <InfoLabeled
            key="keystore"
            className={classes.marginTop}
            label="Keystore File"
            tooltip={KEYSTORE_TOOLTIP}
            element={<SaveOrGenerateKeystore wallet={wallet} />}
          />,
          <InfoLabeled
            key="private-key"
            className={classes.marginTop}
            label="Your Private Key"
            tooltip={PRIVATE_KEY_TOOLTIP}
            element={
              <PasswordField
                id="iv-private-key"
                className={classes.textField}
                value={privateKeyToWIF(wallet.privateKey)}
                copyOnClickName="Private Key"
              />
            }
          />,
          <InfoLabeled
            key="print"
            className={classes.marginTop}
            label="Print Paper Wallet"
            tooltip={PAPER_WALLET_TOOLTIP}
            element={
              <PrintPaperWalletButton
                address={account.id.address}
                privateKey={wallet.privateKey}
              />
            }
          />,
        ];
      }
    }
  }
  return <div className={className}>{content}</div>;
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(InfoView): React.ComponentType<ExternalProps>);

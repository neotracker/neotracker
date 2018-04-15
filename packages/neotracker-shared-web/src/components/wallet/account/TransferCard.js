/* @flow */
import * as React from 'react';
import type { LocalWallet, UserAccount } from '@neo-one/client';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type AppOptions } from '../../../AppContext';
import { type Theme } from '../../../styles/createTheme';
import { TitleCard } from '../../../lib/layout';
import { Typography, withStyles } from '../../../lib/base';

import { fragmentContainer } from '../../../graphql/relay';
import { mapAppOptions } from '../../../utils';

import { type TransferCard_address } from './__generated__/TransferCard_address.graphql';
import TransferView from './TransferView';

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
});

type ExternalProps = {|
  account: ?UserAccount,
  wallet: ?LocalWallet,
  address?: any,
  loading?: boolean,
  error?: ?Error,
  retry?: ?() => void,
  className?: string,
|};
type InternalProps = {|
  address: ?TransferCard_address,
  classes: Object,
  appOptions: AppOptions,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransferCard({
  account,
  wallet,
  address,
  loading,
  error,
  retry,
  className,
  classes,
  appOptions,
}: Props): React.Element<*> {
  let content = (
    <Typography variant="body1">
      Open or create a account to send NEO, GAS and other tokens.
    </Typography>
  );
  if (account != null) {
    if (wallet != null && wallet.type === 'locked') {
      content = (
        <Typography variant="body1">
          Unlock your account to send NEO, GAS and other tokens.
        </Typography>
      );
    } else if (appOptions.disableWalletModify) {
      content = (
        <Typography variant="body1">
          Wallet Maintenance: Transfer and claim disabled.
        </Typography>
      );
    } else {
      content = (
        <TransferView
          address={address}
          account={account}
          loading={loading}
          error={error}
          retry={retry}
        />
      );
    }
  }

  return (
    <TitleCard className={className} title="Transfer">
      <div className={classes.content}>{content}</div>
    </TitleCard>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment TransferCard_address on Address {
        ...TransferView_address
      }
    `,
  }),
  mapAppOptions,
  withStyles(styles),
  pure,
);

export default (enhance(TransferCard): React.ComponentType<ExternalProps>);

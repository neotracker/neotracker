/* @flow */
import { type HOC, compose, getContext, pure } from 'recompose';
import * as React from 'react';
import type { UserAccount } from '@neo-one/client-common';
import type { LocalWallet } from '@neo-one/client-core';

import { graphql } from 'react-relay';

import { InfoCard } from '../info';
import { TransferCard } from '../account';
import { SelectCard } from '../select';
import { type Theme } from '../../../styles/createTheme';
import { WalletTransactionsCard } from '../transaction';
import { WalletTransfersCard } from '../transfer';

import { api as walletAPI } from '../../../wallet';
import { createSafeRetry } from '../../../utils';
import { queryRenderer } from '../../../graphql/relay';
import { withStyles } from '../../../lib/base';

import { type MainWalletViewQueryResponse } from './__generated__/MainWalletViewQuery.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    marginTop: {
      marginTop: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    marginTop: {
      marginTop: theme.spacing.unit * 2,
    },
  },
  marginTop: {},
});

const safeRetry = createSafeRetry();

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  account: ?UserAccount,
  wallet: ?LocalWallet,
  props: ?MainWalletViewQueryResponse,
  lastProps: ?MainWalletViewQueryResponse,
  error: ?Error,
  retry: ?() => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function MainWalletView({
  account,
  wallet,
  props: propsIn,
  lastProps,
  error: errorIn,
  retry,
  className,
  classes,
}: Props): React.Element<any> {
  if (errorIn != null && retry != null) {
    safeRetry(retry);
  } else {
    safeRetry.cancel();
  }

  const props = propsIn || lastProps;
  const error = props == null ? errorIn : null;
  const address = props == null ? null : props.address;
  const loading = props == null;
  return (
    <div className={className}>
      <SelectCard
        account={account}
        wallet={wallet}
        address={address || null}
        loading={loading}
        error={error}
        retry={retry}
      />
      <TransferCard
        className={classes.marginTop}
        account={account}
        wallet={wallet}
        address={address || null}
        loading={loading}
        error={error}
        retry={retry}
      />
      <WalletTransactionsCard
        className={classes.marginTop}
        account={account}
        address={address || null}
        loading={loading}
        error={error}
        retry={retry}
      />
      <WalletTransfersCard
        className={classes.marginTop}
        account={account}
        address={address || null}
        loading={loading}
        error={error}
        retry={retry}
      />
      <InfoCard
        className={classes.marginTop}
        account={account}
        wallet={wallet}
      />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  walletAPI.mapCurrentLocalWallet,
  queryRenderer(
    graphql`
      query MainWalletViewQuery($hash: String!) {
        address(hash: $hash) {
          ...SelectCard_address
          ...TransferCard_address
          ...WalletTransactionsCard_address
          ...WalletTransfersCard_address
        }
      }
    `,
    {
      skipNullVariables: true,
      mapPropsToVariables: {
        client: ({ account }: {| account: ?UserAccount |}) =>
          account == null ? null : { hash: account.id.address },
      },
      cacheConfig: { force: true },
    },
  ),
  getContext({ relayEnvironment: () => null }),
  withStyles(styles),
  pure,
);

export default (enhance(MainWalletView): React.ComponentType<ExternalProps>);

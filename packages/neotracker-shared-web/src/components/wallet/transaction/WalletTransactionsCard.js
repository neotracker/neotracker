/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';
import type { UserAccount } from '@neo-one/client-common';

import { graphql } from 'react-relay';

import { AddressTransactionPagingView } from '../../explorer/address';
import { ErrorView } from '../../common/error';
import { PageLoading } from '../../common/loading';
import { type Theme } from '../../../styles/createTheme';
import { TitleCard } from '../../../lib/layout';
import { Typography, withStyles } from '../../../lib/base';

import { fragmentContainer } from '../../../graphql/relay';

import { type WalletTransactionsCard_address } from './__generated__/WalletTransactionsCard_address.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    padding: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    padding: {
      padding: theme.spacing.unit * 2,
    },
  },
  padding: {},
});

type ExternalProps = {|
  account: ?UserAccount,
  address?: any,
  loading?: boolean,
  error?: ?Error,
  retry?: ?() => void,
  className?: string,
|};
type InternalProps = {|
  address: WalletTransactionsCard_address,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function WalletTransactionsCard({
  account,
  address,
  loading,
  error,
  retry,
  className,
  classes,
}: Props): React.Element<*> {
  const wrapContent = (element) => (
    <div className={classes.padding}>{element}</div>
  );
  let content = wrapContent(
    <Typography variant="body1">
      Open or create a wallet to view transaction history.
    </Typography>,
  );
  if (account != null) {
    if (error != null) {
      content = <ErrorView error={error} retry={retry} allowRetry />;
    } else if (loading) {
      content = <PageLoading />;
    } else {
      content = <AddressTransactionPagingView address={address} />;
    }
  }

  return (
    <TitleCard className={className} title="Transactions" titleComponent="h2">
      {content}
    </TitleCard>
  );
}
const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment WalletTransactionsCard_address on Address {
        ...AddressTransactionPagingView_address
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  WalletTransactionsCard,
): React.ComponentType<ExternalProps>);

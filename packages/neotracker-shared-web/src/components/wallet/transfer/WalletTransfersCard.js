/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';
import type { UserAccount } from '@neo-one/client-common';

import { graphql } from 'react-relay';

import { AddressTransferPagingView } from '../../explorer/address';
import { ErrorView } from '../../common/error';
import { PageLoading } from '../../common/loading';
import { type Theme } from '../../../styles/createTheme';
import { TitleCard } from '../../../lib/layout';
import { Typography, withStyles } from '../../../lib/base';

import { fragmentContainer } from '../../../graphql/relay';

import { type WalletTransfersCard_address } from './__generated__/WalletTransfersCard_address.graphql';

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
  address: any,
  loading?: boolean,
  error?: ?Error,
  retry?: ?() => void,
  className?: string,
|};
type InternalProps = {|
  address: WalletTransfersCard_address,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function WalletTransfersCard({
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
      Open or create a wallet to view transfer history.
    </Typography>,
  );
  if (account != null) {
    if (error != null) {
      content = <ErrorView error={error} retry={retry} allowRetry />;
    } else if (loading) {
      content = <PageLoading />;
    } else {
      content = <AddressTransferPagingView address={address} />;
    }
  }

  return (
    <TitleCard className={className} title="Transfers" titleComponent="h2">
      {content}
    </TitleCard>
  );
}
const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment WalletTransfersCard_address on Address {
        ...AddressTransferPagingView_address
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  WalletTransfersCard,
): React.ComponentType<ExternalProps>);

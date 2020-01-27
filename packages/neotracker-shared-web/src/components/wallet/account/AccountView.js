/* @flow */
import * as React from 'react';
import type { UserAccount } from '@neo-one/client-common';
import type { LocalWallet } from '@neo-one/client-core';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { ErrorView } from '../../common/error';
import { PageLoading } from '../../common/loading';

import { fragmentContainer } from '../../../graphql/relay';

import { type AccountView_address } from './__generated__/AccountView_address.graphql';
import AccountViewBase from './AccountViewBase';

type ExternalProps = {|
  account: UserAccount,
  wallet: ?LocalWallet,
  address?: any,
  loading?: boolean,
  error?: ?Error,
  retry?: ?() => void,
  forward?: boolean,
  className?: string,
|};
type InternalProps = {|
  address: ?AccountView_address,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AccountView({
  account,
  wallet,
  address,
  loading,
  error,
  retry,
  forward,
  className,
}: Props): React.Element<any> {
  if (error != null) {
    return <ErrorView error={error} retry={retry} allowRetry />;
  }

  if (loading) {
    return <PageLoading />;
  }

  return (
    <AccountViewBase
      className={className}
      account={account}
      wallet={wallet}
      address={address}
      onClaimConfirmed={retry}
      forward={forward}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment AccountView_address on Address {
        ...AccountViewBase_address
      }
    `,
  }),
  pure,
);

export default (enhance(AccountView): React.ComponentType<ExternalProps>);

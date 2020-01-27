/* @flow */
import * as React from 'react';
import type { UserAccount } from '@neo-one/client-common';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { ErrorView } from '../../common/error';
import { PageLoading } from '../../common/loading';

import { fragmentContainer } from '../../../graphql/relay';

import { type TransferView_address } from './__generated__/TransferView_address.graphql';
import SendTransaction from './SendTransaction';

type ExternalProps = {|
  account: UserAccount,
  address: any,
  loading?: boolean,
  error?: ?Error,
  retry?: ?() => void,
  className?: string,
|};
type InternalProps = {|
  address: ?TransferView_address,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransferView({
  account,
  address,
  loading,
  error,
  retry,
  className,
}: Props): React.Element<any> {
  if (error != null) {
    return <ErrorView error={error} retry={retry} allowRetry />;
  }

  if (loading) {
    return <PageLoading />;
  }

  return (
    <SendTransaction
      className={className}
      account={account}
      address={address}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment TransferView_address on Address {
        ...SendTransaction_address
      }
    `,
  }),
  pure,
);

export default (enhance(TransferView): React.ComponentType<ExternalProps>);

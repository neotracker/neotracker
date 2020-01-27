/* @flow */
import { type HOC, compose, getContext, pure } from 'recompose';
import * as React from 'react';
import type { UserAccount } from '@neo-one/client-common';
import type { LocalWallet } from '@neo-one/client-core';

import { graphql } from 'react-relay';

import SelectCard from './SelectCard';

import { api as walletAPI } from '../../../wallet';
import { createSafeRetry } from '../../../utils';
import { queryRenderer } from '../../../graphql/relay';

import { type MainSelectCardQueryResponse } from './__generated__/MainSelectCardQuery.graphql';

const safeRetry = createSafeRetry();

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  account: ?UserAccount,
  wallet: ?LocalWallet,
  props: ?MainSelectCardQueryResponse,
  lastProps: ?MainSelectCardQueryResponse,
  error: ?Error,
  retry: ?() => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function MainSelectCard({
  account,
  wallet,
  props: propsIn,
  lastProps,
  error: errorIn,
  retry,
  className,
}: Props): React.Element<any> {
  const props = propsIn || lastProps;
  if (errorIn != null && retry != null) {
    safeRetry(retry);
  } else {
    safeRetry.cancel();
  }
  const error = props == null ? errorIn : null;
  const address = props == null ? null : props.address;
  const loading = props == null;
  return (
    <SelectCard
      className={className}
      account={account}
      wallet={wallet}
      address={address || null}
      loading={loading}
      error={error}
      retry={retry}
      forward
    />
  );
}

const enhance: HOC<*, *> = compose(
  walletAPI.mapCurrentLocalWallet,
  queryRenderer(
    graphql`
      query MainSelectCardQuery($hash: String!) {
        address(hash: $hash) {
          ...SelectCard_address
        }
      }
    `,
    {
      skipNullVariables: true,
      mapPropsToVariables: {
        client: ({ account }: {| account: UserAccount |}) =>
          account == null ? null : { hash: account.id.address },
      },
      cacheConfig: { force: true },
    },
  ),
  getContext({ relayEnvironment: () => null }),
  pure,
);

export default (enhance(MainSelectCard): React.ComponentType<ExternalProps>);

/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { addressToScriptHash } from '@neo-one/client-common';
import { compose, getContext, pure } from 'recompose';
import { graphql } from 'react-relay';

import { PageError } from '../components/common/error';
import { PageLoading } from '../components/common/loading';
import { AddressView } from '../components/explorer/address';
import { Error404 } from '../lib/error';

import { queryRenderer } from '../graphql/relay';

import { type AddressQueryResponse } from './__generated__/AddressQuery.graphql';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?AddressQueryResponse,
  error: ?Error,
  retry: () => void,
  match: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Address({
  props,
  error,
  retry,
  match,
  className,
}: Props): React.Element<any> {
  if (error != null) {
    return <PageError error={error} retry={retry} />;
  }

  if (props == null) {
    return <PageLoading />;
  }

  let hash = match.params.addressHash;
  try {
    addressToScriptHash(hash);
  } catch (err) {
    hash = null;
  }

  if (hash == null) {
    return (
      <div>
        <Helmet>
          <title>{'Address'}</title>
        </Helmet>
        <Error404 />
      </div>
    );
  }

  return (
    <div className={className}>
      <Helmet>
        <title>{`Address ${hash}`}</title>
      </Helmet>
      <AddressView hash={hash} address={props.address} />
    </div>
  );
}

const mapPropsToVariables = ({ match }) => ({
  hash: match.params.addressHash,
});
export default (queryRenderer(
  graphql`
    query AddressQuery($hash: String!) {
      address(hash: $hash) {
        ...AddressView_address
      }
    }
  `,
  {
    mapPropsToVariables: {
      client: mapPropsToVariables,
      server: mapPropsToVariables,
    },
  },
)(
  compose(
    getContext({ appContext: () => null }),
    pure,
  )(Address),
): React.ComponentType<ExternalProps>);

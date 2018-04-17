/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { AssetView } from '../components/explorer/asset';
import { Error404 } from '../lib/error';
import { PageError } from '../components/common/error';
import { PageLoading } from '../components/common/loading';

import { getName } from '../components/explorer/asset/lib';
import { getID, queryRenderer } from '../graphql/relay';

import { type AssetQueryResponse } from './__generated__/AssetQuery.graphql';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?AssetQueryResponse,
  error: ?Error,
  retry: () => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Asset({ props, error, retry, className }: Props): React.Element<any> {
  if (error != null) {
    return <PageError error={error} retry={retry} />;
  }

  if (props == null) {
    return <PageLoading />;
  }

  if (props.asset == null) {
    return (
      <div>
        <Helmet>
          <title>{'Asset'}</title>
        </Helmet>
        <Error404 />
      </div>
    );
  }

  const name = getName(props.asset.symbol, getID(props.asset.id));
  return (
    <div className={className}>
      <Helmet>
        <title>{`${name}`}</title>
      </Helmet>
      <AssetView asset={props.asset} />
    </div>
  );
}

const mapPropsToVariables = ({ match }) => ({
  hash: match.params.assetHash,
});
export default (queryRenderer(
  graphql`
    query AssetQuery($hash: String!) {
      asset(hash: $hash) {
        id
        symbol
        ...AssetView_asset
      }
    }
  `,
  {
    mapPropsToVariables: {
      client: mapPropsToVariables,
      server: mapPropsToVariables,
    },
  },
)(compose(pure)(Asset)): React.ComponentType<ExternalProps>);

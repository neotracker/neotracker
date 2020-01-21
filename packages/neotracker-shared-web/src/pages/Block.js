/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { BlockView } from '../components/explorer/block';
import { Error404 } from '../lib/error';
import { PageError } from '../components/common/error';
import { PageLoading } from '../components/common/loading';

import { getNumericID, queryRenderer } from '../graphql/relay';

import { type BlockQueryResponse } from './__generated__/BlockQuery.graphql';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?BlockQueryResponse,
  error: ?Error,
  retry: () => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Block({ props, error, retry, className }: Props): React.Element<any> {
  if (error != null) {
    return <PageError error={error} retry={retry} />;
  }

  if (props == null) {
    return <PageLoading />;
  }

  if (props.block == null) {
    return (
      <div>
        <Helmet>
          <title>{'Block'}</title>
        </Helmet>
        <Error404 />
      </div>
    );
  }

  return (
    <div className={className}>
      <Helmet>
        <title>{`Block ${getNumericID(props.block.id)}`}</title>
      </Helmet>
      <BlockView block={props.block} />
    </div>
  );
}

const mapPropsToVariables = ({ match }) => ({
  hash: match.params.blockHash,
  index: Number(match.params.blockIndex),
});
export default (queryRenderer(
  graphql`
    query BlockQuery($hash: String, $index: Int) {
      block(hash: $hash, index: $index) {
        id
        ...BlockView_block
      }
    }
  `,
  {
    mapPropsToVariables: {
      client: mapPropsToVariables,
      server: mapPropsToVariables,
    },
  },
)(compose(pure)(Block)): React.ComponentType<ExternalProps>);

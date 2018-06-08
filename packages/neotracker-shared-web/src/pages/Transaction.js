/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { Error404 } from '../lib/error';
import { PageError } from '../components/common/error';
import { PageLoading } from '../components/common/loading';
import { TransactionView } from '../components/explorer/transaction';

import { queryRenderer } from '../graphql/relay';

import { type TransactionQueryResponse } from './__generated__/TransactionQuery.graphql';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?TransactionQueryResponse,
  error: ?Error,
  retry: () => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Transaction({
  props,
  error,
  retry,
  className,
}: Props): React.Element<any> {
  if (error != null) {
    return <PageError error={error} retry={retry} />;
  }

  if (props == null) {
    return <PageLoading />;
  }

  if (props.transaction == null) {
    return (
      <div>
        <Helmet>
          <title>{'Transaction'}</title>
        </Helmet>
        <Error404 />
      </div>
    );
  }

  return (
    <div className={className}>
      <Helmet>
        <title>{`Transaction ${props.transaction.hash}`}</title>
      </Helmet>
      <TransactionView transaction={props.transaction} />
    </div>
  );
}

const mapPropsToVariables = ({ match }) => ({
  hash: match.params.transactionHash,
});
export default (queryRenderer(
  graphql`
    query TransactionQuery($hash: String!) {
      transaction(hash: $hash) {
        hash
        ...TransactionView_transaction
      }
    }
  `,
  {
    mapPropsToVariables: {
      client: mapPropsToVariables,
      server: mapPropsToVariables,
    },
  },
)(compose(pure)(Transaction)): React.ComponentType<ExternalProps>);

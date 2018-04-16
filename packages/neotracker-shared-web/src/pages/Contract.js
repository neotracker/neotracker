/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { ContractView } from '../components/explorer/contract';
import { Error404 } from '../lib/error';
import { PageError } from '../components/common/error';
import { PageLoading } from '../components/common/loading';

import { queryRenderer } from '../graphql/relay';

import { type ContractQueryResponse } from './__generated__/ContractQuery.graphql';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?ContractQueryResponse,
  error: ?Error,
  retry: () => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Contract({
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

  if (props.contract == null) {
    return (
      <div>
        <Helmet>
          <title>{'Contract'}</title>
        </Helmet>
        <Error404 />
      </div>
    );
  }

  return (
    <div className={className}>
      <Helmet>
        <title>{`Contract ${props.contract.name}`}</title>
      </Helmet>
      <ContractView contract={props.contract} />
    </div>
  );
}

const mapPropsToVariables = ({ match }) => ({
  hash: match.params.contractHash,
});
export default (queryRenderer(
  graphql`
    query ContractQuery($hash: String!) {
      contract(hash: $hash) {
        name
        ...ContractView_contract
      }
    }
  `,
  {
    mapPropsToVariables: {
      client: mapPropsToVariables,
      server: mapPropsToVariables,
    },
  },
)(compose(pure)(Contract)): React.ComponentType<ExternalProps>);

/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';
import { Redirect } from 'react-router';

import { addressToScriptHash } from '@neo-one/client';
import { compose, getContext, pure } from 'recompose';
import { graphql } from 'react-relay';
import { tryParseInt } from 'neotracker-shared-utils';

import { Error404 } from '../lib/error';
import { PageError } from '../components/common/error';
import { PageLoading } from '../components/common/loading';

import { getID, queryRenderer } from '../graphql/relay';
import * as routes from '../routes';

import { type SearchQueryResponse } from './__generated__/SearchQuery.graphql';

type ExternalProps = {||};
type InternalProps = {|
  props: ?SearchQueryResponse,
  error: ?Error,
  retry: () => void,
  match: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Search({ props, error, retry, match }: Props): React.Element<any> {
  let element;
  if (error != null) {
    element = <PageError error={error} retry={retry} />;
  } else if (props == null) {
    element = <PageLoading />;
  } else {
    const { address, asset, block, contract, transaction } = props;
    if (address != null) {
      element = <Redirect to={routes.makeAddress(getID(address.id))} />;
    } else if (asset != null) {
      element = <Redirect to={routes.makeAsset(getID(asset.id))} />;
    } else if (block != null) {
      element = <Redirect to={routes.makeBlockIndex(block.index)} />;
    } else if (contract != null) {
      element = <Redirect to={routes.makeContract(getID(contract.id))} />;
    } else if (transaction != null) {
      element = <Redirect to={routes.makeTransaction(getID(transaction.id))} />;
    } else {
      try {
        const { value } = match.params;
        addressToScriptHash(value);
        element = <Redirect to={routes.makeAddress(value)} />;
      } catch (err) {
        element = <Error404 />;
      }
    }
  }

  return (
    <div>
      <Helmet>
        <title>{'Search'}</title>
      </Helmet>
      {element}
    </div>
  );
}

const MAX_INDEX = 100000000;
const mapPropsToVariables = ({ match }) => {
  const { value } = match.params;
  // On the server we use index first if it's non-null
  let index = tryParseInt({
    value,
    default: null,
  });
  if (index > MAX_INDEX) {
    index = null;
  }

  return { value, index };
};

export default (queryRenderer(
  graphql`
    query SearchQuery($value: String!, $index: String) {
      address(hash: $value) {
        id
      }
      asset(hash: $value) {
        id
      }
      block(hash: $value, index: $index) {
        index
      }
      contract(hash: $value) {
        id
      }
      transaction(hash: $value) {
        id
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
  compose(getContext({ appContext: () => null }), pure)(Search),
): React.ComponentType<ExternalProps>);

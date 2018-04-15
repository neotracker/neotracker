/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
import { sanitizeError } from 'neotracker-shared-utils';

import { TransactionPagingView } from '../transaction';

import { fragmentContainer, queryRenderer } from '../../../graphql/relay';
import { getPagingVariables } from '../../../utils';

import { type AddressTransactionPagingView_address } from './__generated__/AddressTransactionPagingView_address.graphql';
import { type AddressTransactionPagingViewQueryResponse } from './__generated__/AddressTransactionPagingViewQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  address: any,
  className?: string,
|};
type InternalProps = {|
  address: ?AddressTransactionPagingView_address,
  props: ?AddressTransactionPagingViewQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?AddressTransactionPagingViewQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AddressTransactionPagingView({
  address,
  className,
  props,
  error,
  lastProps,
  page,
  onUpdatePage,
}: Props): React.Element<*> {
  let currentProps;
  if (props != null) {
    currentProps = props;
  } else if (lastProps != null) {
    currentProps = lastProps;
  }

  let transactions = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const currentAddress = currentProps == null ? null : currentProps.address;
  if (currentAddress != null) {
    transactions = currentAddress.transactions.edges.map(edge => edge.node);
    // eslint-disable-next-line
    hasNextPage = currentAddress.transactions.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <TransactionPagingView
      className={className}
      transactions={transactions}
      isInitialLoad={currentProps == null}
      isLoadingMore={props == null}
      error={error == null ? null : sanitizeError(error).clientMessage}
      page={page}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      pageSize={PAGE_SIZE}
      onUpdatePage={onUpdatePage}
      addressHash={address == null ? undefined : address.hash}
    />
  );
}

const mapPropsToVariables = ({
  address,
  page,
}: {|
  address: AddressTransactionPagingView_address,
  page: number,
|}) =>
  address == null
    ? null
    : {
        hash: address.hash,
        ...getPagingVariables(PAGE_SIZE, page),
      };

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    address: graphql`
      fragment AddressTransactionPagingView_address on Address {
        hash
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: prevState => page => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query AddressTransactionPagingViewQuery(
        $hash: String!
        $first: Int!
        $after: String
      ) {
        address(hash: $hash) {
          hash
          transactions(
            first: $first
            after: $after
            orderBy: [
              { name: "transaction.block_time", direction: "desc nulls first" }
              { name: "transaction.index", direction: "asc nulls last" }
            ]
          ) {
            edges {
              node {
                ...TransactionPagingView_transactions
              }
            }
            pageInfo {
              hasPreviousPage
              hasNextPage
            }
          }
        }
      }
    `,
    {
      mapPropsToVariables: {
        client: mapPropsToVariables,
      },
      skipNullVariables: true,
    },
  ),
  pure,
);

export default (enhance(AddressTransactionPagingView): React.ComponentType<
  ExternalProps,
>);

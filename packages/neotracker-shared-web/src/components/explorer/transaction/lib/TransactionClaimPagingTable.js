/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import TransactionInputTable from './TransactionInputTable';

import { fragmentContainer, queryRenderer } from '../../../../graphql/relay';
import { getPagingVariables } from '../../../../utils';

import { type TransactionClaimPagingTable_transaction } from './__generated__/TransactionClaimPagingTable_transaction.graphql';
import { type TransactionClaimPagingTableQueryResponse } from './__generated__/TransactionClaimPagingTableQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  positive?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: ?TransactionClaimPagingTable_transaction,
  props: ?TransactionClaimPagingTableQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?TransactionClaimPagingTableQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionClaimPagingTable({
  addressHash,
  positive,
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

  let claims = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const transaction = currentProps == null ? null : currentProps.transaction;
  if (transaction != null) {
    claims = transaction.claims.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = transaction.claims.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <TransactionInputTable
      className={className}
      inputs={claims}
      addressHash={addressHash}
      positive={positive}
      isInitialLoad={currentProps == null}
      isLoadingMore={props == null}
      error={error == null ? null : sanitizeError(error).clientMessage}
      page={page}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      pageSize={PAGE_SIZE}
      onUpdatePage={onUpdatePage}
    />
  );
}

const mapPropsToVariables = ({
  transaction,
  page,
}: {|
  transaction: TransactionClaimPagingTable_transaction,
  page: number,
|}) => ({
  hash: transaction.hash,
  ...getPagingVariables(PAGE_SIZE, page),
});

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionClaimPagingTable_transaction on Transaction {
        hash
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: (prevState) => (page) => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query TransactionClaimPagingTableQuery(
        $hash: String!
        $first: Int!
        $after: String
      ) {
        transaction(hash: $hash) {
          claims(
            first: $first
            after: $after
            orderBy: [
              {
                name: "transaction_input_output.output_transaction_index"
                direction: "ASC NULLS LAST"
              }
            ]
          ) {
            edges {
              node {
                ...TransactionInputTable_inputs
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
    },
  ),
  pure,
);

export default (enhance(
  TransactionClaimPagingTable,
): React.ComponentType<ExternalProps>);

/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
import { sanitizeError } from 'neotracker-shared-utils';

import TransactionOutputTable from './TransactionOutputTable';

import {
  fragmentContainer,
  getID,
  queryRenderer,
} from '../../../../graphql/relay';
import { getPagingVariables } from '../../../../utils';

import { type TransactionOutputPagingTable_transaction } from './__generated__/TransactionOutputPagingTable_transaction.graphql';
import { type TransactionOutputPagingTableQueryResponse } from './__generated__/TransactionOutputPagingTableQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  className?: string,
|};
type InternalProps = {|
  transaction: ?TransactionOutputPagingTable_transaction,
  props: ?TransactionOutputPagingTableQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?TransactionOutputPagingTableQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionOutputPagingTable({
  addressHash,
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

  let outputs = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const transaction = currentProps == null ? null : currentProps.transaction;
  if (transaction != null) {
    outputs = transaction.outputs.edges.map(edge => edge.node);
    // eslint-disable-next-line
    hasNextPage = transaction.outputs.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <TransactionOutputTable
      className={className}
      outputs={outputs}
      addressHash={addressHash}
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
  transaction: TransactionOutputPagingTable_transaction,
  page: number,
|}) => ({
  hash: getID(transaction.id),
  ...getPagingVariables(PAGE_SIZE, page),
});

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionOutputPagingTable_transaction on Transaction {
        id
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: prevState => page => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query TransactionOutputPagingTableQuery(
        $hash: String!
        $first: Int!
        $after: String
      ) {
        transaction(hash: $hash) {
          id
          outputs(
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
                ...TransactionOutputTable_outputs
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

export default (enhance(TransactionOutputPagingTable): React.ComponentType<
  ExternalProps,
>);

/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import TransactionInputTable from './TransactionInputTable';

import { fragmentContainer, queryRenderer } from '../../../../graphql/relay';
import { getPagingVariables } from '../../../../utils';

import { type TransactionInputPagingTable_transaction } from './__generated__/TransactionInputPagingTable_transaction.graphql';
import { type TransactionInputPagingTableQueryResponse } from './__generated__/TransactionInputPagingTableQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  transaction: any,
  transfers?: Array<{|
    +to_address_id: ?string,
    +from_address_id: ?string,
    +value: string,
    +asset: any,
  |}>,
  offset?: number,
  addressHash?: string,
  positive?: boolean,
  className?: string,
|};
type InternalProps = {|
  transaction: ?TransactionInputPagingTable_transaction,
  props: ?TransactionInputPagingTableQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?TransactionInputPagingTableQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionInputPagingTable({
  addressHash,
  transfers,
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

  let inputs = [];
  const transferInputs = [];
  if (transfers != null && page === 1) {
    for (const transfer of transfers) {
      if (transfer.from_address_id != null) {
        transferInputs.push({
          address_id: transfer.from_address_id,
          value: transfer.value,
          asset: transfer.asset,
        });
      }
    }
  }
  let hasNextPage = false;
  let hasPreviousPage = false;
  const transaction = currentProps == null ? null : currentProps.transaction;
  if (transaction != null) {
    inputs = transaction.inputs.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = transaction.inputs.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <TransactionInputTable
      className={className}
      inputs={inputs}
      transfers={transferInputs}
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
  offset,
}: {|
  transaction: TransactionInputPagingTable_transaction,
  page: number,
  offset: number,
|}) => ({
  hash: transaction.hash,
  ...getPagingVariables(PAGE_SIZE, page, offset),
});

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionInputPagingTable_transaction on Transaction {
        hash
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: (prevState) => (page) => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query TransactionInputPagingTableQuery(
        $hash: String!
        $first: Int!
        $after: String
      ) {
        transaction(hash: $hash) {
          inputs(
            first: $first
            after: $after
            orderBy: [
              {
                name: "transaction_input_output.output_transaction_index"
                direction: "asc"
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
  TransactionInputPagingTable,
): React.ComponentType<ExternalProps>);

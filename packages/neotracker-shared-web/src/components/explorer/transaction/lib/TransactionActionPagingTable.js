/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import { ActionTable } from '../../action/lib';

import { fragmentContainer, queryRenderer } from '../../../../graphql/relay';
import { getPagingVariables } from '../../../../utils';

import { type TransactionActionPagingTable_transaction } from './__generated__/TransactionActionPagingTable_transaction.graphql';
import { type TransactionActionPagingTableQueryResponse } from './__generated__/TransactionActionPagingTableQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  transaction: any,
  addressHash?: string,
  className?: string,
|};
type InternalProps = {|
  transaction: ?TransactionActionPagingTable_transaction,
  props: ?TransactionActionPagingTableQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?TransactionActionPagingTableQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionActionPagingTable({
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

  let actions = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const transaction = currentProps == null ? null : currentProps.transaction;
  if (transaction != null) {
    actions = transaction.actions.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = transaction.actions.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <ActionTable
      className={className}
      actions={actions}
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
  transaction: TransactionActionPagingTable_transaction,
  page: number,
|}) => ({
  hash: transaction.hash,
  ...getPagingVariables(PAGE_SIZE, page),
});

const enhance: HOC<*, *> = (compose(
  fragmentContainer({
    transaction: graphql`
      fragment TransactionActionPagingTable_transaction on Transaction {
        hash
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: (prevState) => (page) => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query TransactionActionPagingTableQuery(
        $hash: String!
        $first: Int!
        $after: String
      ) {
        transaction(hash: $hash) {
          actions(
            first: $first
            after: $after
            orderBy: [{ name: "action.index", direction: "asc" }]
          ) {
            edges {
              node {
                ...ActionTable_actions
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
): $FlowFixMe);

export default (enhance(
  TransactionActionPagingTable,
): React.ComponentType<ExternalProps>);

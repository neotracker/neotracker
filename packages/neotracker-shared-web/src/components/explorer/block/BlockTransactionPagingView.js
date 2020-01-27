/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import { TransactionPagingView } from '../transaction';

import {
  fragmentContainer,
  getNumericID,
  queryRenderer,
} from '../../../graphql/relay';
import { getPagingVariables } from '../../../utils';

import { type BlockTransactionPagingView_block } from './__generated__/BlockTransactionPagingView_block.graphql';
import { type BlockTransactionPagingViewQueryResponse } from './__generated__/BlockTransactionPagingViewQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  block: any,
  className?: string,
|};
type InternalProps = {|
  block: ?BlockTransactionPagingView_block,
  props: ?BlockTransactionPagingViewQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?BlockTransactionPagingViewQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BlockTransactionPagingView({
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
  const block = currentProps == null ? null : currentProps.block;
  if (block != null) {
    transactions = block.transactions.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = block.transactions.pageInfo.hasNextPage;
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
    />
  );
}

const mapPropsToVariables = ({
  block,
  page,
}: {|
  block: BlockTransactionPagingView_block,
  page: number,
|}) => ({
  index: getNumericID(block.id),
  ...getPagingVariables(PAGE_SIZE, page),
});

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    block: graphql`
      fragment BlockTransactionPagingView_block on Block {
        id
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: (prevState) => (page) => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query BlockTransactionPagingViewQuery(
        $index: Int!
        $first: Int!
        $after: String
      ) {
        block(index: $index) {
          transactions(
            first: $first
            after: $after
            orderBy: [{ name: "transaction.index", direction: "asc" }]
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
    },
  ),
  pure,
);

export default (enhance(
  BlockTransactionPagingView,
): React.ComponentType<ExternalProps>);

/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import { TransactionPagingView } from '../transaction';

import {
  fragmentContainer,
  getID,
  queryRenderer,
} from '../../../graphql/relay';
import { getPagingVariables } from '../../../utils';

import { type AssetTransactionPagingView_asset } from './__generated__/AssetTransactionPagingView_asset.graphql';
import { type AssetTransactionPagingViewQueryResponse } from './__generated__/AssetTransactionPagingViewQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  asset: any,
  className?: string,
|};
type InternalProps = {|
  asset: ?AssetTransactionPagingView_asset,
  props: ?AssetTransactionPagingViewQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?AssetTransactionPagingViewQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetTransactionPagingView({
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
  const asset = currentProps == null ? null : currentProps.asset;
  if (asset != null) {
    transactions = asset.transactions.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = asset.transactions.pageInfo.hasNextPage;
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
  asset,
  page,
}: {|
  asset: AssetTransactionPagingView_asset,
  page: number,
|}) => ({
  hash: getID(asset.id),
  ...getPagingVariables(PAGE_SIZE, page),
});

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    asset: graphql`
      fragment AssetTransactionPagingView_asset on Asset {
        id
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: (prevState) => (page) => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query AssetTransactionPagingViewQuery(
        $hash: String!
        $first: Int!
        $after: String
      ) {
        asset(hash: $hash) {
          id
          transactions(
            first: $first
            after: $after
            orderBy: [
              {
                name: "asset_to_transaction.id2"
                direction: "desc"
                type: "literal"
              }
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
    },
  ),
  pure,
);

export default (enhance(
  AssetTransactionPagingView,
): React.ComponentType<ExternalProps>);

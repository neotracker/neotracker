/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import { TransferPagingView } from '../transfer';

import {
  fragmentContainer,
  getID,
  queryRenderer,
} from '../../../graphql/relay';
import { getPagingVariables } from '../../../utils';

import { type AssetTransferPagingView_asset } from './__generated__/AssetTransferPagingView_asset.graphql';
import { type AssetTransferPagingViewQueryResponse } from './__generated__/AssetTransferPagingViewQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  asset: any,
  className?: string,
|};
type InternalProps = {|
  asset: ?AssetTransferPagingView_asset,
  props: ?AssetTransferPagingViewQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?AssetTransferPagingViewQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetTransferPagingView({
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

  let transfers = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const asset = currentProps == null ? null : currentProps.asset;
  if (asset != null) {
    transfers = asset.transfers.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = asset.transfers.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <TransferPagingView
      className={className}
      transfers={transfers}
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
  asset: AssetTransferPagingView_asset,
  page: number,
|}) => ({
  hash: getID(asset.id),
  ...getPagingVariables(PAGE_SIZE, page),
});

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    asset: graphql`
      fragment AssetTransferPagingView_asset on Asset {
        id
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: (prevState) => (page) => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query AssetTransferPagingViewQuery(
        $hash: String!
        $first: Int!
        $after: String
      ) {
        asset(hash: $hash) {
          id
          transfers(
            first: $first
            after: $after
            orderBy: [{ name: "transfer.id", direction: "desc" }]
          ) {
            edges {
              node {
                ...TransferPagingView_transfers
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
  AssetTransferPagingView,
): React.ComponentType<ExternalProps>);

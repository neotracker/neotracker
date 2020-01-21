/* @flow */
import * as React from 'react';

import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import { graphql } from 'react-relay';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import { AddressPagingView } from '../address';
import { Coin } from '../address/lib';

import {
  fragmentContainer,
  getID,
  queryRenderer,
} from '../../../graphql/relay';
import { getPagingVariables } from '../../../utils';

import { type AssetAddressPagingView_asset } from './__generated__/AssetAddressPagingView_asset.graphql';
import { type AssetAddressPagingViewQueryResponse } from './__generated__/AssetAddressPagingViewQuery.graphql';

const PAGE_SIZE = 10;

type ExternalProps = {|
  asset: any,
  className?: string,
|};
type InternalProps = {|
  asset: ?AssetAddressPagingView_asset,
  props: ?AssetAddressPagingViewQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?AssetAddressPagingViewQueryResponse,
  page: number,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetAddressPagingView({
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

  let coins = [];
  let addresses = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const asset = currentProps == null ? null : currentProps.asset;
  if (asset != null) {
    coins = asset.coins.edges.map((edge) => edge.node);
    addresses = coins.map((coin) => coin.address);
    // eslint-disable-next-line
    hasNextPage = asset.coins.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  const coinMap = {};
  coins.forEach((coin) => {
    coinMap[getID(coin.address.id)] = coin;
  });

  return (
    <AddressPagingView
      className={className}
      addresses={addresses}
      renderCoin={(hash) => <Coin coin={coinMap[hash]} />}
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
  asset: AssetAddressPagingView_asset,
  page: number,
|}) => ({
  hash: getID(asset.id),
  ...getPagingVariables(PAGE_SIZE, page),
});

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    asset: graphql`
      fragment AssetAddressPagingView_asset on Asset {
        id
      }
    `,
  }),
  withStateHandlers(() => ({ page: 1 }), {
    onUpdatePage: (prevState) => (page) => ({ ...prevState, page }),
  }),
  queryRenderer(
    graphql`
      query AssetAddressPagingViewQuery(
        $hash: String!
        $first: Int!
        $after: String
      ) {
        asset(hash: $hash) {
          id
          coins(
            first: $first
            after: $after
            orderBy: [
              { name: "coin.value", direction: "desc" }
              { name: "coin.id", direction: "desc" }
            ]
          ) {
            edges {
              node {
                ...Coin_coin
                id
                value
                address {
                  id
                  ...AddressPagingView_addresses
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
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
  AssetAddressPagingView,
): React.ComponentType<ExternalProps>);

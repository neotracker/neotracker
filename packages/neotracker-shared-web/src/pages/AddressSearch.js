/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { compose, pure, withHandlers } from 'recompose';
import { graphql } from 'react-relay';
import { withRouter } from 'react-router';

import { COIN_TABLE_ROW_HEIGHT } from '../components/explorer/address/lib/CoinTable';
import { PageError } from '../components/common/error';
import { CoinTable } from '../components/explorer/address/lib';
import { AddressPagingView } from '../components/explorer/address';
import { SearchView } from '../components/common/view';

import getSortedCoins from '../components/explorer/address/lib/getSortedCoins';
import { getID, queryRenderer } from '../graphql/relay';
import * as routes from '../routes';

import { PAGE_SIZE, getPage, mapPropsToVariables } from './commonSearch';

import { type AddressSearchQueryResponse } from './__generated__/AddressSearchQuery.graphql';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?AddressSearchQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?AddressSearchQueryResponse,
  match: any,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AddressSearch({
  props,
  error,
  retry,
  lastProps,
  match,
  onUpdatePage,
  className,
}: Props): React.Element<any> {
  if (error != null) {
    return <PageError error={error} retry={retry} />;
  }

  let currentProps;
  if (props != null) {
    currentProps = props;
  } else if (lastProps != null) {
    currentProps = lastProps;
  }

  let addresses = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const addressesMap = {};
  const rowHeightMap = {};
  const renderCoin = (hash) => (
    <CoinTable
      coins={addressesMap[hash].coins.edges.map((coinEdge) => coinEdge.node)}
    />
  );
  const getRowHeight = (idx) => rowHeightMap[idx];

  const page = getPage(match);
  if (currentProps != null) {
    addresses = currentProps.addresses.edges.map((edge) => edge.node);
    currentProps.addresses.edges.forEach((edge, idx) => {
      addressesMap[getID(edge.node.id)] = edge.node;
      const sortedCoins = getSortedCoins(
        edge.node.coins.edges.map((coinEdge) => coinEdge.node),
      );
      rowHeightMap[idx] = sortedCoins.length * COIN_TABLE_ROW_HEIGHT;
    });
    // eslint-disable-next-line
    hasNextPage = currentProps.addresses.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <div>
      <Helmet>
        <title>{'Browse Addresses'}</title>
      </Helmet>
      <SearchView
        className={className}
        name="Address"
        pluralName="Addresses"
        content={
          <AddressPagingView
            addresses={addresses}
            renderCoin={renderCoin}
            isInitialLoad={currentProps == null}
            isLoadingMore={props == null}
            page={page}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            pageSize={PAGE_SIZE}
            onUpdatePage={onUpdatePage}
            getRowHeight={getRowHeight}
          />
        }
      />
    </div>
  );
}

export default (queryRenderer(
  graphql`
    query AddressSearchQuery($first: Int!, $after: String) {
      addresses(
        orderBy: [
          { name: "address.block_id", direction: "desc" }
          { name: "address.id", direction: "asc" }
        ]
        first: $first
        after: $after
      ) {
        edges {
          node {
            ...AddressPagingView_addresses
            id
            coins {
              edges {
                node {
                  ...CoinTable_coins
                  value
                  asset {
                    id
                    symbol
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
  {
    mapPropsToVariables: {
      client: mapPropsToVariables(PAGE_SIZE),
      server: mapPropsToVariables(PAGE_SIZE),
    },
  },
)(
  compose(
    withRouter,
    withHandlers({
      onUpdatePage: ({ history }) => (page) =>
        history.push(routes.makeAddressSearch(page)),
    }),
    pure,
  )(AddressSearch),
): React.ComponentType<ExternalProps>);

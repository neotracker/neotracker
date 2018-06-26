/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { compose, pure, withHandlers } from 'recompose';
import { graphql } from 'react-relay';
import { withRouter } from 'react-router';

import { AssetPagingView } from '../components/explorer/asset';
import { PageError } from '../components/common/error';
import { SearchView } from '../components/common/view';

import { queryRenderer } from '../graphql/relay';
import * as routes from '../routes';

import { type AssetSearchQueryResponse } from './__generated__/AssetSearchQuery.graphql';

import { PAGE_SIZE, getPage, mapPropsToVariables } from './commonSearch';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?AssetSearchQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?AssetSearchQueryResponse,
  match: any,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetSearch({
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

  let assets = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const page = getPage(match);
  if (currentProps != null) {
    assets = currentProps.assets.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = currentProps.assets.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <div>
      <Helmet>
        <title>{'Browse Assets'}</title>
      </Helmet>
      <SearchView
        className={className}
        name="Asset"
        pluralName="Assets"
        content={
          <AssetPagingView
            assets={assets}
            isInitialLoad={currentProps == null}
            isLoadingMore={props == null}
            page={page}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            pageSize={PAGE_SIZE}
            onUpdatePage={onUpdatePage}
          />
        }
      />
    </div>
  );
}

export default (queryRenderer(
  graphql`
    query AssetSearchQuery($first: Int!, $after: String) {
      assets(
        orderBy: [
          { name: "asset.transaction_count", direction: "desc" }
          { name: "asset.id", direction: "asc" }
        ]
        first: $first
        after: $after
        filters: [
          {
            name: "asset.id"
            operator: "!="
            value: "cb453a56856a236cbae8b8f937db308a15421daada4ba6ce78123b59bfb7253c"
          }
          {
            name: "asset.id"
            operator: "!="
            value: "6161af8875eb78654e385a33e7334a473a2a0519281d33c06780ff3c8bce15ea"
          }
        ]
      ) {
        edges {
          node {
            ...AssetPagingView_assets
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
        history.push(routes.makeAssetSearch(page)),
    }),
    pure,
  )(AssetSearch),
): React.ComponentType<ExternalProps>);

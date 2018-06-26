/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { compose, pure, withHandlers } from 'recompose';
import { graphql } from 'react-relay';
import { withRouter } from 'react-router';

import { BlockPagingView } from '../components/explorer/block';
import { PageError } from '../components/common/error';
import { SearchView } from '../components/common/view';

import { queryRenderer } from '../graphql/relay';
import * as routes from '../routes';

import { type BlockSearchQueryResponse } from './__generated__/BlockSearchQuery.graphql';

import { PAGE_SIZE, getPage, mapPropsToVariables } from './commonSearch';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?BlockSearchQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?BlockSearchQueryResponse,
  match: any,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BlockSearch({
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

  const page = getPage(match);
  let blocks = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  if (currentProps != null) {
    blocks = currentProps.blocks.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = currentProps.blocks.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <div>
      <Helmet>
        <title>{'Browse Blocks'}</title>
      </Helmet>
      <SearchView
        className={className}
        name="Block"
        pluralName="Blocks"
        content={
          <BlockPagingView
            blocks={blocks}
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
    query BlockSearchQuery($first: Int!, $after: String) {
      blocks(
        orderBy: [{ name: "block.id", direction: "desc" }]
        first: $first
        after: $after
      ) {
        edges {
          node {
            ...BlockPagingView_blocks
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
        history.push(routes.makeBlockSearch(page)),
    }),
    pure,
  )(BlockSearch),
): React.ComponentType<ExternalProps>);

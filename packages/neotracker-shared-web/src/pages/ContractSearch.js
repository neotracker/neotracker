/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { compose, pure, withHandlers } from 'recompose';
import { graphql } from 'react-relay';
import { withRouter } from 'react-router';

import { ContractPagingView } from '../components/explorer/contract';
import { PageError } from '../components/common/error';
import { SearchView } from '../components/common/view';

import { queryRenderer } from '../graphql/relay';
import * as routes from '../routes';

import { type ContractSearchQueryResponse } from './__generated__/ContractSearchQuery.graphql';

import { PAGE_SIZE, getPage, mapPropsToVariables } from './commonSearch';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?ContractSearchQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?ContractSearchQueryResponse,
  match: any,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ContractSearch({
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

  let contracts = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const page = getPage(match);
  if (currentProps != null) {
    contracts = currentProps.contracts.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = currentProps.contracts.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <div>
      <Helmet>
        <title>{'Browse Contracts'}</title>
      </Helmet>
      <SearchView
        className={className}
        name="Contract"
        pluralName="Contracts"
        content={
          <ContractPagingView
            contracts={contracts}
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
    query ContractSearchQuery($first: Int!, $after: String) {
      contracts(
        orderBy: [
          { name: "contract.block_id", direction: "desc" }
          { name: "contract.id", direction: "desc" }
        ]
        first: $first
        after: $after
      ) {
        edges {
          node {
            ...ContractPagingView_contracts
          }
        }
        pageInfo {
          hasPreviousPage
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
        history.push(routes.makeContractSearch(page)),
    }),
    pure,
  )(ContractSearch),
): React.ComponentType<ExternalProps>);

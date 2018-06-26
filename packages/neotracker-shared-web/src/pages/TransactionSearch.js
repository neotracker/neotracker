/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { compose, pure, withHandlers } from 'recompose';
import { graphql } from 'react-relay';
import { withRouter } from 'react-router';

import { PageError } from '../components/common/error';
import { TransactionPagingView } from '../components/explorer/transaction';
import { SearchView } from '../components/common/view';

import { queryRenderer } from '../graphql/relay';
import * as routes from '../routes';

import { type TransactionSearchQueryResponse } from './__generated__/TransactionSearchQuery.graphql';

import { getPage, mapPropsToVariables } from './commonSearch';

const PAGE_SIZE = 10;

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?TransactionSearchQueryResponse,
  error: ?Error,
  retry: () => void,
  lastProps: ?TransactionSearchQueryResponse,
  match: any,
  onUpdatePage: (page: number) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionSearch({
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

  let transactions = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  const page = getPage(match);
  if (currentProps != null) {
    transactions = currentProps.transactions.edges.map((edge) => edge.node);
    // eslint-disable-next-line
    hasNextPage = currentProps.transactions.pageInfo.hasNextPage;
    hasPreviousPage = page > 1;
  }

  return (
    <div>
      <Helmet>
        <title>{'Browse Transactions'}</title>
      </Helmet>
      <SearchView
        className={className}
        name="Transaction"
        pluralName="Transactions"
        content={
          <TransactionPagingView
            transactions={transactions}
            isInitialLoad={currentProps == null}
            isLoadingMore={props == null}
            page={page}
            pageSize={PAGE_SIZE}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onUpdatePage={onUpdatePage}
          />
        }
      />
    </div>
  );
}

export default (queryRenderer(
  graphql`
    query TransactionSearchQuery($first: Int!, $after: String) {
      transactions(
        orderBy: [{ name: "transaction.id", direction: "desc" }]
        filters: [
          {
            name: "transaction.type"
            operator: "!="
            value: "MinerTransaction"
          }
        ]
        first: $first
        after: $after
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
        history.push(routes.makeTransactionSearch(page)),
    }),
    pure,
  )(TransactionSearch),
): React.ComponentType<ExternalProps>);

/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { PagingView } from '../../common/view';

import { fragmentContainer } from '../../../graphql/relay';

import TransactionTable from './TransactionTable';
import { type TransactionPagingView_transactions } from './__generated__/TransactionPagingView_transactions.graphql';

type ExternalProps = {|
  transactions: any,
  isInitialLoad?: boolean,
  isLoadingMore: boolean,
  error?: ?string,
  page: number,
  pageSize: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
  onUpdatePage: (page: number) => void,
  addressHash?: string,
  className?: string,
|};
type InternalProps = {|
  transactions: TransactionPagingView_transactions,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionPagingView({
  transactions,
  isInitialLoad,
  isLoadingMore,
  error,
  page,
  pageSize,
  hasPreviousPage,
  hasNextPage,
  onUpdatePage,
  addressHash,
  className,
}: Props): React.Element<*> {
  return (
    <PagingView
      className={className}
      content={
        <TransactionTable
          transactions={transactions}
          addressHash={addressHash}
        />
      }
      isInitialLoad={!!isInitialLoad}
      isLoadingMore={isLoadingMore}
      error={error}
      page={page}
      pageSize={pageSize}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      currentPageSize={transactions == null ? null : transactions.length}
      onUpdatePage={onUpdatePage}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transactions: graphql`
      fragment TransactionPagingView_transactions on Transaction
        @relay(plural: true) {
        ...TransactionTable_transactions
      }
    `,
  }),
  pure,
);

export default (enhance(
  TransactionPagingView,
): React.ComponentType<ExternalProps>);

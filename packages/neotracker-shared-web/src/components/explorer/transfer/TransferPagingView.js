/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { PagingView } from '../../common/view';

import { fragmentContainer } from '../../../graphql/relay';

import TransferTable from './TransferTable';
import { type TransferPagingView_transfers } from './__generated__/TransferPagingView_transfers.graphql';

type ExternalProps = {|
  transfers: any,
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
  transfers: TransferPagingView_transfers,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransferPagingView({
  transfers,
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
        <TransferTable transfers={transfers} addressHash={addressHash} />
      }
      isInitialLoad={!!isInitialLoad}
      isLoadingMore={isLoadingMore}
      error={error}
      page={page}
      currentPageSize={transfers == null ? null : transfers.length}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      pageSize={pageSize}
      onUpdatePage={onUpdatePage}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    transfers: graphql`
      fragment TransferPagingView_transfers on Transfer @relay(plural: true) {
        ...TransferTable_transfers
      }
    `,
  }),
  pure,
);

export default (enhance(
  TransferPagingView,
): React.ComponentType<ExternalProps>);

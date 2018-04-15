/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { PagingView } from '../../common/view';

import { fragmentContainer } from '../../../graphql/relay';

import AddressTable from './AddressTable';
import { type AddressPagingView_addresses } from './__generated__/AddressPagingView_addresses.graphql';

type ExternalProps = {|
  addresses: any,
  renderCoin: (hash: string) => React.Element<any>,
  getRowHeight?: (idx: number) => ?number,
  isInitialLoad?: boolean,
  isLoadingMore: boolean,
  error?: ?string,
  page: number,
  pageSize: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
  onUpdatePage: (page: number) => void,
  className?: string,
|};
type InternalProps = {|
  addresses: AddressPagingView_addresses,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AddressPagingView({
  addresses,
  renderCoin,
  getRowHeight,
  isInitialLoad,
  isLoadingMore,
  error,
  page,
  pageSize,
  hasPreviousPage,
  hasNextPage,
  onUpdatePage,
  className,
}: Props): React.Element<*> {
  return (
    <PagingView
      className={className}
      content={
        <AddressTable
          addresses={addresses}
          renderCoin={renderCoin}
          getRowHeight={getRowHeight}
        />
      }
      isInitialLoad={!!isInitialLoad}
      isLoadingMore={isLoadingMore}
      error={error}
      page={page}
      pageSize={pageSize}
      currentPageSize={addresses == null ? null : addresses.length}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      onUpdatePage={onUpdatePage}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    addresses: graphql`
      fragment AddressPagingView_addresses on Address @relay(plural: true) {
        ...AddressTable_addresses
      }
    `,
  }),
  pure,
);

export default (enhance(AddressPagingView): React.ComponentType<ExternalProps>);

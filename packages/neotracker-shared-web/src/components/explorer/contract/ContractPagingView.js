/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { PagingView } from '../../common/view';

import { fragmentContainer } from '../../../graphql/relay';

import ContractTable from './ContractTable';
import { type ContractPagingView_contracts } from './__generated__/ContractPagingView_contracts.graphql';

type ExternalProps = {|
  contracts: any,
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
  contracts: ContractPagingView_contracts,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ContractPagingView({
  contracts,
  isInitialLoad,
  isLoadingMore,
  error,
  page,
  hasPreviousPage,
  hasNextPage,
  pageSize,
  onUpdatePage,
  className,
}: Props): React.Element<*> {
  return (
    <PagingView
      className={className}
      content={<ContractTable contracts={contracts} />}
      isInitialLoad={!!isInitialLoad}
      isLoadingMore={isLoadingMore}
      error={error}
      page={page}
      currentPageSize={contracts == null ? null : contracts.length}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      pageSize={pageSize}
      onUpdatePage={onUpdatePage}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    contracts: graphql`
      fragment ContractPagingView_contracts on Contract @relay(plural: true) {
        ...ContractTable_contracts
      }
    `,
  }),
  pure,
);

export default (enhance(
  ContractPagingView,
): React.ComponentType<ExternalProps>);

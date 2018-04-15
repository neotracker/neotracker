/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { PagingView } from '../../common/view';

import { fragmentContainer } from '../../../graphql/relay';

import AssetTable from './AssetTable';
import { type AssetPagingView_assets } from './__generated__/AssetPagingView_assets.graphql';

type ExternalProps = {|
  assets: any,
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
  assets: AssetPagingView_assets,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetPagingView({
  assets,
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
      content={<AssetTable assets={assets} />}
      isLoadingMore={isLoadingMore}
      isInitialLoad={!!isInitialLoad}
      error={error}
      page={page}
      currentPageSize={assets == null ? null : assets.length}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      pageSize={pageSize}
      onUpdatePage={onUpdatePage}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    assets: graphql`
      fragment AssetPagingView_assets on Asset @relay(plural: true) {
        ...AssetTable_assets
      }
    `,
  }),
  pure,
);

export default (enhance(AssetPagingView): React.ComponentType<ExternalProps>);

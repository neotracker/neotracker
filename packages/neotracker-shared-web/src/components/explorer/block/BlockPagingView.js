/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { PagingView } from '../../common/view';

import { fragmentContainer } from '../../../graphql/relay';

import BlockTable from './BlockTable';
import { type BlockPagingView_blocks } from './__generated__/BlockPagingView_blocks.graphql';

type ExternalProps = {|
  blocks: any,
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
  blocks: BlockPagingView_blocks,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BlockPagingView({
  blocks,
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
      content={
        <BlockTable
          blocks={blocks}
          sizeVisibleAt="xs"
          validatorVisibleAt="sm"
        />
      }
      isInitialLoad={!!isInitialLoad}
      isLoadingMore={isLoadingMore}
      error={error}
      page={page}
      currentPageSize={blocks == null ? null : blocks.length}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      pageSize={pageSize}
      onUpdatePage={onUpdatePage}
    />
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    blocks: graphql`
      fragment BlockPagingView_blocks on Block @relay(plural: true) {
        ...BlockTable_blocks
      }
    `,
  }),
  pure,
);

export default (enhance(BlockPagingView): React.ComponentType<ExternalProps>);

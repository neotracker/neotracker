/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { PageLoading } from '../loading';

import RightPager from './RightPager';

type ExternalProps = {|
  content: React.Element<any>,
  isInitialLoad: boolean,
  isLoadingMore: boolean,
  page: number,
  pageSize: number,
  currentPageSize: ?number,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
  onUpdatePage: (page: number) => void,
  error?: ?string,
  omitPager?: boolean,
  disablePadding?: boolean,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PagingView({
  content,
  isInitialLoad,
  isLoadingMore,
  error,
  className,
  page,
  pageSize,
  currentPageSize,
  hasPreviousPage,
  hasNextPage,
  omitPager,
  disablePadding,
  onUpdatePage,
}: Props): React.Element<*> {
  return (
    <div className={className}>
      {isInitialLoad ? <PageLoading /> : content}
      {omitPager ? null : (
        <RightPager
          page={page}
          pageSize={pageSize}
          currentPageSize={currentPageSize}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onUpdatePage={onUpdatePage}
          isLoading={isLoadingMore}
          error={error}
          disablePadding={disablePadding}
        />
      )}
    </div>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(PagingView): React.ComponentType<ExternalProps>);

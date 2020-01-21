/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import classNames from 'classnames';
import { graphql } from 'react-relay';

import { PagingView } from '../../../common/view';

import { fragmentContainer, getID } from '../../../../graphql/relay';
import { withStyles } from '../../../../lib/base';

import { type ActionTable_actions } from './__generated__/ActionTable_actions.graphql';
import LogItem from './LogItem';
import NotificationItem from './NotificationItem';

const styles = () => ({
  root: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    maxWidth: '100%',
    minWidth: '0',
  },
  contentRoot: {
    display: 'flex',
    flex: '0 1 auto',
    maxWidth: '100%',
    minWidth: '0',
  },
});

type ExternalProps = {|
  actions: any,
  addressHash?: string,
  page: number,
  isInitialLoad: boolean,
  isLoadingMore: boolean,
  error: ?string,
  hasNextPage: boolean,
  hasPreviousPage: boolean,
  pageSize: number,
  onUpdatePage: (page: number) => void,
  className?: string,
|};
type InternalProps = {|
  actions: ActionTable_actions,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ActionTable({
  actions,
  addressHash,
  className,
  page,
  isInitialLoad,
  isLoadingMore,
  error,
  hasNextPage,
  hasPreviousPage,
  pageSize,
  onUpdatePage,
  classes,
}: Props): React.Element<*> {
  const content = (
    <div className={classes.contentRoot}>
      {actions.map((action) =>
        action.type === 'Log' ? (
          <LogItem key={getID(action.id)} action={action} />
        ) : (
          <NotificationItem
            key={getID(action.id)}
            action={action}
            addressHash={addressHash}
          />
        ),
      )}
    </div>
  );
  return (
    <PagingView
      className={classNames(className, classes.root)}
      content={content}
      isInitialLoad={isInitialLoad}
      isLoadingMore={isLoadingMore}
      page={page}
      pageSize={pageSize}
      currentPageSize={actions.length}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      onUpdatePage={onUpdatePage}
      error={error}
      omitPager={!hasNextPage && !hasPreviousPage}
      disablePadding
    />
  );
}

const enhance: HOC<*, *> = (compose(
  fragmentContainer({
    actions: graphql`
      fragment ActionTable_actions on Action @relay(plural: true) {
        id
        type
        ...LogItem_action
        ...NotificationItem_action
      }
    `,
  }),
  withStyles(styles),
  pure,
): $FlowFixMe);

export default (enhance(ActionTable): React.ComponentType<ExternalProps>);

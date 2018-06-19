/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Pager } from '../../../lib/pager';

import { withStyles } from '../../../lib/base';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    padding: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    padding: {
      padding: theme.spacing.unit * 2,
    },
  },
  pagerArea: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  padding: {},
});

type ExternalProps = {|
  page: number,
  pageSize: number,
  onUpdatePage: (page: number) => void,
  currentPageSize: ?number,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
  isLoading?: boolean,
  error?: ?string,
  disablePadding?: boolean,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function RightPager({
  page,
  pageSize,
  currentPageSize,
  hasPreviousPage,
  hasNextPage,
  onUpdatePage,
  isLoading,
  error,
  disablePadding,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div
      className={classNames(
        {
          [classes.padding]: !disablePadding,
        },
        classes.pagerArea,
        className,
      )}
    >
      <Pager
        page={page}
        pageSize={pageSize}
        currentPageSize={currentPageSize}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onUpdatePage={onUpdatePage}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(RightPager): React.ComponentType<ExternalProps>);

/* @flow */
import BigNumber from 'bignumber.js';
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure, withHandlers } from 'recompose';

import {
  CircularProgress,
  Icon,
  IconButton,
  Typography,
  withStyles,
} from '../base';

const styles = (theme: any) => ({
  root: {
    alignItems: 'center',
    display: 'flex',
  },
  count: {
    ...theme.typography.caption,
    paddingRight: theme.spacing.unit * 2,
  },
  error: {
    color: theme.palette.error[500],
  },
  margin: {
    marginRight: theme.spacing.unit * 2,
  },
});

const formatNumber = (value: number | string) =>
  new BigNumber(value).toFormat();

type ExternalProps = {|
  page: number,
  pageSize: number,
  currentPageSize: ?number,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
  onUpdatePage: (page: number) => void,
  isLoading?: boolean,
  error?: ?string,
  className?: string,
|};
type InternalProps = {|
  onDecrementPage: () => void,
  onIncrementPage: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Pager({
  page,
  pageSize,
  currentPageSize,
  hasPreviousPage,
  hasNextPage,
  isLoading,
  error,
  className,
  onDecrementPage,
  onIncrementPage,
  classes,
}: Props): React.Element<*> {
  let start = 1;
  let end = 1;
  let totalElement = <span className={classes.count}>0 - 0</span>;
  if (currentPageSize != null) {
    start = (page - 1) * pageSize + 1;
    end = start + currentPageSize - 1;
    if (end === 0) {
      start = 0;
    }
    totalElement = (
      <span className={classes.count}>
        {`${formatNumber(start)} - ${formatNumber(end)}`}
      </span>
    );
  }

  return (
    <div className={classNames(classes.root, className)}>
      {error != null ? (
        <Typography
          className={classNames(classes.margin, classes.error)}
          variant="body1"
        >
          {error}
        </Typography>
      ) : null}
      {isLoading ? (
        <CircularProgress size={32} thickness={5} className={classes.margin} />
      ) : null}
      {totalElement}
      <IconButton
        disabled={isLoading || !hasPreviousPage}
        onClick={onDecrementPage}
      >
        <Icon>keyboard_arrow_left</Icon>
      </IconButton>
      <IconButton
        disabled={isLoading || !hasNextPage}
        onClick={onIncrementPage}
      >
        <Icon>keyboard_arrow_right</Icon>
      </IconButton>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withHandlers({
    onIncrementPage: ({ page, onUpdatePage }) => () => onUpdatePage(page + 1),
    onDecrementPage: ({ page, onUpdatePage }) => () => onUpdatePage(page - 1),
  }),
  withStyles(styles),
  pure,
);

export default (enhance(Pager): React.ComponentType<ExternalProps>);

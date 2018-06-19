/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Typography, withStyles } from '../../../lib/base';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    firstColRow: {
      paddingRight: theme.spacing.unit,
    },
    root: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    firstColRow: {
      paddingRight: theme.spacing.unit * 2,
    },
    root: {
      padding: theme.spacing.unit * 2,
    },
  },
  root: {
    display: 'flex',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  firstCol: {
    flex: '0 0 auto',
  },
  secondCol: {
    flex: '1 1 auto',
    minWidth: '0',
  },
  label: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  firstColRow: {},
  firstRow: {
    paddingBottom: theme.spacing.unit / 2,
  },
  row: {
    paddingBottom: theme.spacing.unit / 2,
    paddingTop: theme.spacing.unit / 2,
  },
  rowBorder: {
    borderTop: `1px solid ${theme.custom.lightDivider}`,
  },
  lastRow: {
    paddingTop: theme.spacing.unit / 2,
  },
  text: {
    minWidth: '0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  baseRow: {
    minHeight: theme.spacing.unit * 3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

type ExternalProps = {|
  columns: Array<
    | [string, React.Element<any> | string]
    | [string, React.Element<any> | string, number],
  >,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TableView({ columns, className, classes }: Props): React.Element<*> {
  const wrapRow = (element, idx, height, firstCol) => (
    <div
      key={idx}
      className={classNames({
        [classes.firstColRow]: !!firstCol,
        [classes.firstRow]: idx === 0,
        [classes.row]: idx !== 0 && idx !== columns.length - 1,
        [classes.rowBorder]: idx !== 0,
        [classes.lastRow]: idx === columns.length - 1,
        [classes.baseRow]: true,
      })}
      style={height == null ? undefined : { height }}
    >
      {typeof element === 'string' ? (
        <Typography key="hash" className={classes.text} variant="body1">
          {element}
        </Typography>
      ) : (
        element
      )}
    </div>
  );
  return (
    <div className={classNames(className, classes.root)}>
      <div className={classNames(classes.col, classes.firstCol)}>
        {columns.map((column, idx) =>
          wrapRow(
            <Typography
              key={column[0]}
              className={classes.label}
              variant="body1"
            >
              {column[0]}
            </Typography>,
            idx,
            // $FlowFixMe
            column.length === 3 ? column[2] : null,
            true,
          ),
        )}
      </div>
      <div className={classNames(classes.col, classes.secondCol)}>
        {columns.map((column, idx) =>
          wrapRow(
            column[1],
            idx,
            // $FlowFixMe
            column.length === 3 ? column[2] : null,
          ),
        )}
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(TableView): React.ComponentType<ExternalProps>);

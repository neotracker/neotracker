/* @flow */
/* eslint-disable react/no-array-index-key */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Hidden, Typography, withStyles } from '../../../lib/base';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    paddingLeft: {
      paddingLeft: theme.spacing.unit,
    },
    firstCol: {
      paddingLeft: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    paddingLeft: {
      paddingLeft: theme.spacing.unit * 3,
    },
    firstCol: {
      paddingLeft: theme.spacing.unit * 2,
    },
  },
  [theme.breakpoints.up('md')]: {
    paddingLeft: {
      paddingLeft: theme.spacing.unit * 5,
    },
  },
  root: {
    flex: '1 1 auto',
    flexDirection: 'column',
  },
  minWidth: {
    minWidth: '0',
  },
  alwaysVisible: {
    display: 'flex',
  },
  baseRow: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
    minHeight: 48,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  row: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.text.primary,
  },
  header: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.secondary,
  },
  textRowBase: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  oddRow: {
    backgroundColor: theme.custom.lightDivider,
  },
  numeric: {
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
  paddingLeft: {},
  firstCol: {},
});

type ExternalProps = {|
  name: string,
  values: Array<string | React.Element<any>>,
  numeric?: boolean,
  minWidth?: boolean,
  visibleAt?: string,
  firstCol: boolean,
  getRowHeight?: (idx: number) => ?number,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Column({
  name,
  values,
  numeric,
  minWidth,
  visibleAt,
  firstCol,
  getRowHeight: getRowHeightIn,
  className,
  classes,
}: Props): React.Element<any> {
  // eslint-disable-next-line
  const getRowHeight = getRowHeightIn || ((idx: number) => null);
  const wrapValue = value =>
    typeof value === 'string' ? (
      <Typography
        className={classNames(classes.textRowBase, classes.row)}
        variant="body1"
      >
        {value}
      </Typography>
    ) : (
      value
    );
  const cells = values.map((value, idx) => {
    let style;
    const rowHeight = getRowHeight(idx);
    if (rowHeight != null) {
      style = { height: rowHeight };
    }
    return (
      <div
        key={idx}
        className={classNames({
          [classes.paddingLeft]: !firstCol,
          [classes.firstCol]: firstCol,
          [classes.baseRow]: true,
          [classes.row]: true,
          [classes.oddRow]: idx % 2 === 1,
          [classes.numeric]: !!numeric,
        })}
        style={style}
      >
        {wrapValue(value)}
      </div>
    );
  });
  const element = (
    <div
      className={classNames(
        {
          [classes.root]: true,
          [classes.alwaysVisible]: true,
          [classes.minWidth]: !minWidth,
        },
        className,
      )}
    >
      <div
        className={classNames({
          [classes.paddingLeft]: !firstCol,
          [classes.firstCol]: firstCol,
          [classes.baseRow]: true,
          [classes.numeric]: !!numeric,
        })}
      >
        <Typography
          className={classNames(classes.textRowBase, classes.header)}
          variant="body1"
        >
          {name}
        </Typography>
      </div>
      {cells}
    </div>
  );

  // flowlint-next-line sketchy-null-string:off
  if (process.env.BUILD_FLAG_IS_SERVER) {
    return element;
  }

  return (
    <Hidden
      xsDown={visibleAt === 'xs'}
      smDown={visibleAt === 'sm'}
      mdDown={visibleAt === 'md'}
      lgDown={visibleAt === 'lg'}
      xlDown={visibleAt === 'xl'}
      implementation="js"
    >
      {element}
    </Hidden>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(Column): React.ComponentType<ExternalProps>);

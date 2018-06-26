/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';

import { withStyles } from '../../../lib/base';

import Column from './Column';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      '& > div:last-child > div': {
        paddingRight: theme.spacing.unit,
      },
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      '& > div:last-child > div': {
        paddingRight: theme.spacing.unit * 2,
      },
    },
  },
  root: {
    display: 'flex',
  },
});

type ColumnType = {
  name: string,
  className?: string,
  values: Array<string | React.Element<any>>,
  numeric?: boolean,
  visibleAt?: string,
  minWidth?: boolean,
};

type ExternalProps = {|
  columns: Array<ColumnType>,
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
function Table({
  columns,
  getRowHeight,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      {columns.map((col, idx) => (
        <Column
          key={col.name}
          className={col.className}
          name={col.name}
          values={col.values}
          numeric={col.numeric}
          visibleAt={col.visibleAt}
          firstCol={idx === 0}
          minWidth={col.minWidth}
          getRowHeight={getRowHeight}
        />
      ))}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(Table): React.ComponentType<ExternalProps>);

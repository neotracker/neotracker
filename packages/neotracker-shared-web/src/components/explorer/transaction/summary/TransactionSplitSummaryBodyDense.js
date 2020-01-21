/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../../styles/createTheme';
import { DownArrow } from '../lib';

import { withStyles } from '../../../../lib/base';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  col: {
    display: 'flex',
    flex: '1 1 auto',
  },
  arrow: {
    alignItems: 'center',
    display: 'flex',
    flex: '0 0 auto',
    justifyContent: 'center',
    marginBottom: theme.spacing.unit / 2,
    marginTop: theme.spacing.unit / 2,
  },
  divider: {
    backgroundColor: theme.custom.lightDivider,
    flex: '1 1 auto',
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    height: 1,
  },
  right: {
    justifyContent: 'flex-end',
  },
  extraRight: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0',
  },
});

type ExternalProps = {|
  left: any,
  right: any,
  extraRight?: any,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionSplitSummaryBodyDense({
  left,
  right: rightIn,
  extraRight,
  className,
  classes,
}: Props): React.Element<*> {
  let right = rightIn;
  if (extraRight != null) {
    right = (
      <div className={classes.extraRight}>
        {right}
        {extraRight}
      </div>
    );
  }
  return (
    <div className={classNames(className, classes.root)}>
      <div className={classes.col}>{left}</div>
      <div className={classes.arrow}>
        <div className={classes.divider} />
        <DownArrow />
        <div className={classes.divider} />
      </div>
      <div className={classNames(classes.col, classes.right)}>{right}</div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(
  TransactionSplitSummaryBodyDense,
): React.ComponentType<ExternalProps>);

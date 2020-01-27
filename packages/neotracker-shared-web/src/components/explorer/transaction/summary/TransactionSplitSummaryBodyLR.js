/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../../styles/createTheme';
import { RightArrow } from '../lib';

import { withStyles } from '../../../../lib/base';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
  },
  col: {
    display: 'flex',
    flex: '1 1 auto',
    maxWidth: 'calc(50% - 20px)',
    minWidth: '0',
  },
  arrow: {
    alignItems: 'center',
    display: 'flex',
    flex: '0 0 auto',
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: theme.spacing.unit / 2,
    marginRight: theme.spacing.unit / 2,
  },
  divider: {
    backgroundColor: theme.custom.lightDivider,
    flex: '1 1 auto',
    marginBottom: 8,
    marginTop: 8,
    width: 1,
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
function TransactionSplitSummaryBodyLR({
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
        <RightArrow />
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
  TransactionSplitSummaryBodyLR,
): React.ComponentType<ExternalProps>);

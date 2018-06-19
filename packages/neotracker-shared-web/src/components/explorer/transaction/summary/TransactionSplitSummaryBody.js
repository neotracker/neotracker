/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../../styles/createTheme';

import { withStyles } from '../../../../lib/base';

import TransactionSplitSummaryBodyDense from './TransactionSplitSummaryBodyDense';
import TransactionSplitSummaryBodyLR from './TransactionSplitSummaryBodyLR';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    dense: {
      display: 'initial',
    },
    lr: {
      display: 'none',
    },
  },
  [theme.breakpoints.up('sm')]: {
    dense: {
      display: 'none',
    },
    lr: {
      display: 'initial',
    },
  },
  [theme.breakpoints.up('md')]: {
    denseDense: {
      display: 'initial',
    },
    denseLR: {
      display: 'none',
    },
  },
  [theme.breakpoints.up('lg')]: {
    denseDense: {
      display: 'none',
    },
    denseLR: {
      display: 'initial',
    },
  },
  dense: {},
  lr: {},
  denseDense: {},
  denseLR: {},
});

type ExternalProps = {|
  left: any,
  right: any,
  extraRight?: any,
  dense?: boolean,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionSplitSummaryBody({
  left,
  right,
  extraRight,
  dense,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={className}>
      <div
        className={classNames({
          [classes.dense]: true,
          [classes.denseDense]: dense,
        })}
      >
        <TransactionSplitSummaryBodyDense
          left={left}
          right={right}
          extraRight={extraRight}
        />
      </div>
      <div
        className={classNames({
          [classes.lr]: true,
          [classes.denseLR]: dense,
        })}
      >
        <TransactionSplitSummaryBodyLR
          left={left}
          right={right}
          extraRight={extraRight}
        />
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(TransactionSplitSummaryBody): React.ComponentType<
  ExternalProps,
>);

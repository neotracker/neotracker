/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Hidden } from '../../../../lib/base';

import TransactionSplitSummaryBodyDense from './TransactionSplitSummaryBodyDense';
import TransactionSplitSummaryBodyLR from './TransactionSplitSummaryBodyLR';

type ExternalProps = {|
  left: any,
  right: any,
  extraRight?: any,
  dense?: boolean,
  className?: string,
|};

type Props = {|
  ...ExternalProps,
|};
function TransactionSplitSummaryBody({
  left,
  right,
  extraRight,
  dense,
  className,
}: Props): React.Element<*> {
  const denseDense = dense ? ['xs', 'sm', 'md'] : ['xs', 'sm', 'md', 'lg'];
  const lrDense = dense ? ['lg', 'xl'] : ['xl'];
  return (
    <div className={className}>
      <Hidden implementation="js" initialWidth="md" only={denseDense}>
        <TransactionSplitSummaryBodyDense
          left={left}
          right={right}
          extraRight={extraRight}
        />
      </Hidden>
      <Hidden implementation="js" initialWidth="md" only={lrDense}>
        <TransactionSplitSummaryBodyLR
          left={left}
          right={right}
          extraRight={extraRight}
        />
      </Hidden>
    </div>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(
  TransactionSplitSummaryBody,
): React.ComponentType<ExternalProps>);

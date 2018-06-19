/* @flow */
import BigNumber from 'bignumber.js';
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { CoinValue } from '../../address/lib';

import { withStyles } from '../../../../lib/base';

const styles = () => ({
  value: {
    textAlign: 'right',
  },
});

type ExternalProps = {|
  value: string,
  negative?: boolean,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionValue({
  value: valueIn,
  negative,
  className,
  classes,
}: Props): React.Element<*> {
  let value = valueIn;
  if (negative) {
    value = new BigNumber(value).negated().toString();
  }
  return (
    <CoinValue className={classNames(classes.value, className)} value={value} />
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(TransactionValue): React.ComponentType<ExternalProps>);

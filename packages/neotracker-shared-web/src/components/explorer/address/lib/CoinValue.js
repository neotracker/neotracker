/* @flow */
import * as React from 'react';
import type { Variant } from '@material-ui/core/Typography';

import { type HOC, compose, pure } from 'recompose';

import { Typography } from '../../../../lib/base';

import { formatNumber } from '../../../../utils';

type ExternalProps = {|
  value: string,
  variant?: Variant,
  component?: string,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function CoinValue({
  value,
  variant: variantIn,
  component,
  className,
}: Props): React.Element<*> {
  const variant = variantIn == null ? 'body1' : variantIn;
  return (
    <Typography className={className} variant={variant} component={component}>
      {formatNumber(value)}
    </Typography>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(CoinValue): React.ComponentType<ExternalProps>);

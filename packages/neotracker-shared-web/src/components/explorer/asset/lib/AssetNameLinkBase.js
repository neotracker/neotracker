/* @flow */
import * as React from 'react';
import type { Variant } from 'material-ui/Typography/Typography';

import { type HOC, compose, pure } from 'recompose';

import { Link } from '../../../../lib/link';

import * as routes from '../../../../routes';

import { type AssetNameLink_asset } from './__generated__/AssetNameLink_asset.graphql';

import getName from './getName';

type ExternalProps = {|
  asset: AssetNameLink_asset,
  variant?: Variant,
  component?: string,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetNameLinkBase({
  asset,
  variant: variantIn,
  component,
  className,
}: Props): React.Element<*> {
  const variant = variantIn == null ? 'body1' : variantIn;
  return (
    <Link
      className={className}
      variant={variant}
      component={component}
      path={routes.makeAsset(asset.hash)}
      title={getName(asset.symbol, asset.hash)}
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(AssetNameLinkBase): React.ComponentType<ExternalProps>);

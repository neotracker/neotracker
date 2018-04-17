/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';
import { graphql } from 'react-relay';

import { fragmentContainer } from '../../../../graphql/relay';

import { type AssetNameLink_asset } from './__generated__/AssetNameLink_asset.graphql';
import AssetNameLinkBase from './AssetNameLinkBase';

type ExternalProps = {|
  asset: any,
  className?: string,
|};
type InternalProps = {|
  asset: AssetNameLink_asset,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetNameLink({ asset, className }: Props): React.Element<*> {
  return <AssetNameLinkBase className={className} asset={asset} />;
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    asset: graphql`
      fragment AssetNameLink_asset on Asset {
        id
        symbol
      }
    `,
  }),
  pure,
);

export default (enhance(AssetNameLink): React.ComponentType<ExternalProps>);

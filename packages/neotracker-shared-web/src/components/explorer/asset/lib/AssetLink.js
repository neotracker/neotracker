/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Link } from '../../../../lib/link';

import * as routes from '../../../../routes';

type ExternalProps = {|
  assetHash: string,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetLink({ assetHash, className }: Props): React.Element<*> {
  return (
    <Link
      className={className}
      variant="body1"
      path={routes.makeAsset(assetHash)}
      title={assetHash}
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(AssetLink): React.ComponentType<ExternalProps>);

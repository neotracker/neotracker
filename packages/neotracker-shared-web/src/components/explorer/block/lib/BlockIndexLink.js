/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Link } from '../../../../lib/link';

import { formatNumber } from '../../../../utils';
import * as routes from '../../../../routes';

type ExternalProps = {|
  blockIndex: number,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BlockIndexLink({ blockIndex, className }: Props): React.Element<*> {
  return (
    <Link
      className={className}
      variant="body1"
      path={routes.makeBlockIndex(blockIndex)}
      title={formatNumber(blockIndex)}
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(BlockIndexLink): React.ComponentType<ExternalProps>);

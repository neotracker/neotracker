/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Link } from '../../../../lib/link';

import * as routes from '../../../../routes';

type ExternalProps = {|
  blockHash: string,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BlockHashLink({ blockHash, className }: Props): React.Element<*> {
  return (
    <Link
      className={className}
      variant="body1"
      path={routes.makeBlockHash(blockHash)}
      title={blockHash}
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(BlockHashLink): React.ComponentType<ExternalProps>);

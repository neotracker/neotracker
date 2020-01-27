/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Link } from '../../../../lib/link';

import { BlockTime } from '../../block/lib';

import * as routes from '../../../../routes';

type ExternalProps = {|
  transactionHash: ?string,
  blockTime: ?number,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionTimeLink({
  transactionHash,
  blockTime,
  className,
}: Props): React.Element<any> {
  const title = <BlockTime blockTime={blockTime} />;
  if (transactionHash == null) {
    return title;
  }

  return (
    <Link
      className={className}
      variant="body1"
      path={routes.makeTransaction(transactionHash)}
      title={title}
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(
  TransactionTimeLink,
): React.ComponentType<ExternalProps>);

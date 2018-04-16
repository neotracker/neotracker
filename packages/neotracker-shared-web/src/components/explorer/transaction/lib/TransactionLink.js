/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Link } from '../../../../lib/link';

import * as routes from '../../../../routes';

type ExternalProps = {|
  transactionHash: string,
  newTab?: boolean,
  component?: string,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TransactionLink({
  transactionHash,
  newTab,
  component,
  className,
}: Props): React.Element<*> {
  return (
    <Link
      className={className}
      variant="body1"
      component={component}
      newTab={newTab}
      path={routes.makeTransaction(transactionHash)}
      title={transactionHash}
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(TransactionLink): React.ComponentType<ExternalProps>);

/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Link } from '../../../../lib/link';

import * as routes from '../../../../routes';

type ExternalProps = {|
  contractHash: string,
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ContractLink({ contractHash, className }: Props): React.Element<*> {
  return (
    <Link
      className={className}
      variant="body1"
      path={routes.makeContract(contractHash)}
      title={contractHash}
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(ContractLink): React.ComponentType<ExternalProps>);

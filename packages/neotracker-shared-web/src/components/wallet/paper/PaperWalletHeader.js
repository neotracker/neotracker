/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import * as routes from '../../../routes';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PaperWalletHeader({ className }: Props): React.Element<*> {
  return (
    <img
      alt="NEO Tracker"
      className={className}
      src={routes.makePublic('/paper-wallet-sidebar.png')}
      height="100%"
      width="auto"
    />
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(PaperWalletHeader): React.ComponentType<ExternalProps>);

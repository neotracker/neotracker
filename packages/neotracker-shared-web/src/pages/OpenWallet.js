/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';
import Helmet from 'react-helmet';
import * as React from 'react';

import { CardView } from '../lib/layout';
import { OpenWalletView } from '../components/wallet/open';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function OpenWallet({ className }: Props): React.Element<*> {
  return (
    <CardView className={className} title="Open Wallet">
      <Helmet>
        <title>{'Open Wallet'}</title>
      </Helmet>
      <OpenWalletView />
    </CardView>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(OpenWallet): React.ComponentType<ExternalProps>);

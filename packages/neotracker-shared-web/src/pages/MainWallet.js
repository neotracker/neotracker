/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';
import Helmet from 'react-helmet';
import * as React from 'react';

import { CenteredView } from '../lib/layout';
import { MainWalletView } from '../components/wallet/main';
import { SendTransactionDialog } from '../components/wallet/account';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function MainWallet({ className }: Props): React.Element<*> {
  return (
    <CenteredView className={className}>
      <Helmet>
        <title>{'Wallet'}</title>
      </Helmet>
      <MainWalletView />
      <SendTransactionDialog />
    </CenteredView>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(MainWallet): React.ComponentType<ExternalProps>);

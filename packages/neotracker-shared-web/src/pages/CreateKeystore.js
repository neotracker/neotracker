/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';
import Helmet from 'react-helmet';
import type { LocalWallet } from '@neo-one/client-core';
import * as React from 'react';
import { Redirect } from 'react-router-dom';

import { CardView } from '../lib/layout';
import { CreateKeystoreFlow } from '../components/wallet/keystore';

import { api as walletAPI } from '../wallet';
import * as routes from '../routes';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  wallet: ?LocalWallet,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function CreateKeystore({ wallet, className }: Props): React.Element<any> {
  if (wallet == null || wallet.type === 'locked') {
    return <Redirect to={routes.WALLET_HOME} />;
  }

  return (
    <CardView className={className} title="Create Keystore">
      <Helmet>
        <title>{'Create Keystore'}</title>
      </Helmet>
      <CreateKeystoreFlow wallet={wallet} />
    </CardView>
  );
}

const enhance: HOC<*, *> = compose(
  walletAPI.mapCurrentLocalWallet,
  pure,
);

export default (enhance(CreateKeystore): React.ComponentType<ExternalProps>);

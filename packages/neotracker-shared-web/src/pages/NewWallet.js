/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';
import Helmet from 'react-helmet';
import * as React from 'react';

import { CardView } from '../lib/layout';
import { NewWalletFlow } from '../components/wallet/new';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function NewWallet({ className }: Props): React.Element<*> {
  return (
    <CardView className={className} title="New Wallet">
      <Helmet>
        <title>{'New Wallet'}</title>
      </Helmet>
      <NewWalletFlow />
    </CardView>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(NewWallet): React.ComponentType<ExternalProps>);

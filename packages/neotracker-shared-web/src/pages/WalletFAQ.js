/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';

import Helmet from 'react-helmet';
import * as React from 'react';

import { CardView } from '../lib/layout';
import { WalletFAQView } from '../components/wallet/faq';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function WalletFAQ({ className }: Props): React.Element<*> {
  return (
    <CardView className={className} title="Wallet FAQ">
      <Helmet>
        <title>{'Wallet FAQ'}</title>
      </Helmet>
      <WalletFAQView />
    </CardView>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(WalletFAQ): React.ComponentType<ExternalProps>);

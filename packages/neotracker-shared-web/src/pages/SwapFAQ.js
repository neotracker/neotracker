/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';

import Helmet from 'react-helmet';
import * as React from 'react';

import { CardView } from '../lib/layout';
import { SwapFAQView } from '../components/exchange/faq';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SwapFAQ({ className }: Props): React.Element<*> {
  return (
    <CardView className={className} title="Swap FAQ">
      <Helmet>
        <title>{'Swap FAQ'}</title>
      </Helmet>
      <SwapFAQView />
    </CardView>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(SwapFAQ): React.ComponentType<ExternalProps>);

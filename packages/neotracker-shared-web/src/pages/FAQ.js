/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';

import Helmet from 'react-helmet';
import * as React from 'react';

import { CardView } from '../lib/layout';
import { GeneralFAQView } from '../components/faq';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function GeneralFAQ({ className }: Props): React.Element<*> {
  return (
    <CardView className={className} title="FAQ">
      <Helmet>
        <title>{'FAQ'}</title>
      </Helmet>
      <GeneralFAQView />
    </CardView>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(GeneralFAQ): React.ComponentType<ExternalProps>);

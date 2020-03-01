/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';

import Helmet from 'react-helmet';
import * as React from 'react';

import { MainEcosystemView } from '../components/ecosystem/main';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Ecosystem({ className }: Props): React.Element<*> {
  return (
    <div className={className}>
      <Helmet>
        <title>{'Ecosystem'}</title>
      </Helmet>
      <MainEcosystemView className={className} />
    </div>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(Ecosystem): React.ComponentType<ExternalProps>);

/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';
import Helmet from 'react-helmet';
import * as React from 'react';
import { CenteredView } from '../lib/layout';
import { MainSwapView } from '../components/exchange/main';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Swap({ className }: Props): React.Element<*> {
  return (
    <CenteredView className={className}>
      <Helmet>
        <title>{'Buy NEO'}</title>
      </Helmet>
      <MainSwapView />
    </CenteredView>
  );
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(Swap): React.ComponentType<ExternalProps>);

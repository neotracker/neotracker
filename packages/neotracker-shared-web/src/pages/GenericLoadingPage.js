/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { PageLoading } from '../components/common/loading';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function GenericLoadingPage({ className }: Props): React.Element<*> {
  return <PageLoading className={className} />;
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(
  GenericLoadingPage,
): React.ComponentType<ExternalProps>);

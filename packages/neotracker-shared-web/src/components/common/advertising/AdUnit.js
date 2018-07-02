/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import type { AppOptions } from '../../../AppContext';

import { mapAppOptions } from '../../../utils';

type ExternalProps = {|
  children?: React.Element<*>,
  className?: string,
|};
type InternalProps = {|
  appOptions: AppOptions,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AdUnit({ appOptions, children, className }: Props): ?React.Element<*> {
  if (appOptions.bsaEnabled) {
    return <div className={className}>{children}</div>;
  }

  return null;
}

const enhance: HOC<*, *> = compose(
  mapAppOptions,
  pure,
);

export default (enhance(AdUnit): React.ComponentType<ExternalProps>);

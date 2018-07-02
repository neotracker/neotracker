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
class AdUnit extends React.Component<Props, void> {
  render(): ?React.Element<*> {
    const { appOptions, children, className } = this.props;
    if (appOptions.bsaEnabled) {
      return <div className={className}>{children}</div>;
    }

    return undefined;
  }
}

const enhance: HOC<*, *> = compose(
  mapAppOptions,
  pure,
);

export default (enhance(AdUnit): React.ComponentType<ExternalProps>);

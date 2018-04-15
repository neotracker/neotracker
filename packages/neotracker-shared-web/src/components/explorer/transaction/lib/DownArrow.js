/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Icon } from '../../../../lib/base';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {||};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function DownArrow({ className }: Props): React.Element<*> {
  return <Icon className={className}>keyboard_arrow_down</Icon>;
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(DownArrow): React.ComponentType<ExternalProps>);

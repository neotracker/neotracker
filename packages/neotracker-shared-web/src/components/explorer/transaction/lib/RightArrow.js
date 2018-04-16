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
function RightArrow({ className }: Props): React.Element<*> {
  return <Icon className={className}>keyboard_arrow_right</Icon>;
}

const enhance: HOC<*, *> = compose(pure);

export default (enhance(RightArrow): React.ComponentType<ExternalProps>);

/* @flow */
import * as React from 'react';
import MUIIcon, { type IconProps } from 'material-ui/Icon/Icon';

import { pure } from 'recompose';

type ExternalProps = {|
  ...IconProps,
  children?: any,
  className?: string,
|};
type InternalProps = {||};
type Props = {
  ...ExternalProps,
  ...InternalProps,
};
function Icon({ className, children, ...other }: Props): React.Element<*> {
  return (
    <MUIIcon
      color={other.color}
      fontSize={other.fontSize}
      className={className}
    >
      {children}
    </MUIIcon>
  );
}

export default (pure(Icon): React.ComponentType<ExternalProps>);

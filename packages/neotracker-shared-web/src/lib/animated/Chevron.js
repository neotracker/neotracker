/* @flow */
import type { IconProps } from 'material-ui/Icon/Icon';
import * as React from 'react';

import classNames from 'classnames';
import { compose, hoistStatics, pure } from 'recompose';

import { Icon, withStyles } from '../base';

const styles = (theme: any) => ({
  chevron: {
    cursor: 'pointer',
    transition: theme.transitions.create(['transform']),
  },
  chevronUp: {
    transform: 'rotate(0deg)',
  },
  chevronDown: {
    transform: 'rotate(180deg)',
  },
});

type ExternalProps = {|
  ...IconProps,
  up: boolean,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {
  ...ExternalProps,
  ...InternalProps,
};
function Chevron({
  up,
  className,
  classes,
  ...otherProps
}: Props): React.Element<*> {
  return (
    <Icon
      color={otherProps.color}
      fontSize={otherProps.fontSize}
      className={classNames(
        {
          [classes.chevron]: true,
          [classes.chevronUp]: up,
          [classes.chevronDown]: !up,
        },
        className,
      )}
    >
      keyboard_arrow_up
    </Icon>
  );
}

export default (hoistStatics(compose(withStyles(styles), pure))(
  Chevron,
): React.ComponentType<ExternalProps>);

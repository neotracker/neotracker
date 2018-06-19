/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';
import MUIIcon, { type IconProps } from '@material-ui/core/Icon';

import classNames from 'classnames';
import withStyles from './withStyles';

const styles = () => ({
  root: {
    minWidth: '1em',
  },
});

type ExternalProps = {|
  ...IconProps,
  children?: any,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {
  ...ExternalProps,
  ...InternalProps,
};
function Icon({
  className,
  children,
  classes,
  ...other
}: Props): React.Element<*> {
  return (
    <MUIIcon
      color={other.color}
      fontSize={other.fontSize}
      className={classNames(classes.root, className)}
    >
      {children}
    </MUIIcon>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(Icon): React.ComponentType<ExternalProps>);

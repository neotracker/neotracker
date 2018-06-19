/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Icon, withStyles } from '../base';
import { Tooltip } from '../tooltip';

const styles = () => ({
  root: {
    cursor: 'pointer',
  },
});

type ExternalProps = {|
  tooltip: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Help({ tooltip, className, classes }: Props): React.Element<*> {
  return (
    <Tooltip className={classes.root} title={tooltip} position="bottom">
      <Icon className={className}>help_outline</Icon>
    </Tooltip>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(Help): React.ComponentType<ExternalProps>);

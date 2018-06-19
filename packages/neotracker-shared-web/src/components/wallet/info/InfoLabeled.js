/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Help } from '../../../lib/help';
import { Typography, withStyles } from '../../../lib/base';

const styles = (theme: Theme) => ({
  labelArea: {
    alignItems: 'center',
    display: 'flex',
  },
  label: {
    marginLeft: theme.spacing.unit,
  },
  element: {
    marginLeft: theme.spacing.unit * 4,
    marginTop: theme.spacing.unit,
  },
});

type ExternalProps = {|
  label: string,
  tooltip: string,
  element: React.Element<any>,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function InfoLabeled({
  label,
  tooltip,
  element,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={className}>
      <div className={classes.labelArea}>
        <Help tooltip={tooltip} />
        <Typography className={classes.label} variant="body2">
          {label}
        </Typography>
      </div>
      <div className={classes.element}>{element}</div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(InfoLabeled): React.ComponentType<ExternalProps>);

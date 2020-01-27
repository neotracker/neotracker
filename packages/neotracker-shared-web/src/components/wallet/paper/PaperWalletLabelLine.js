/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { Typography, withStyles } from '../../../lib/base';

const styles = () => ({
  borderBox: {
    boxSizing: 'border-box',
  },
});

type ExternalProps = {|
  label: string,
  value: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PaperWalletLabelLine({
  label,
  value,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <Typography
      className={classNames(className, classes.borderBox)}
      variant="body1"
      component="p"
    >
      <span className={classes.borderBox}>{label}</span>
      <br className={classes.borderBox} />
      <span className={classes.borderBox}>{value}</span>
    </Typography>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(
  PaperWalletLabelLine,
): React.ComponentType<ExternalProps>);

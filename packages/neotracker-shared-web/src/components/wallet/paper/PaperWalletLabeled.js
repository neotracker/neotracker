/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Typography, withStyles } from '../../../lib/base';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
  },
  label: {
    color: theme.palette.primary[500],
    display: 'flex',
    justifyContent: 'center',
    paddingRight: theme.spacing.unit,
    transform: 'rotate(-180deg)',
    writingMode: 'vertical-rl',
  },
  borderBox: {
    boxSizing: 'border-box',
  },
});

type ExternalProps = {|
  element: React.Element<any>,
  label: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PaperWalletLabeled({
  element,
  label,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(classes.root, classes.borderBox, className)}>
      {element}
      <Typography
        className={classNames(classes.label, classes.borderBox)}
        variant="body1"
        component="p"
      >
        {label}
      </Typography>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(
  PaperWalletLabeled,
): React.ComponentType<ExternalProps>);

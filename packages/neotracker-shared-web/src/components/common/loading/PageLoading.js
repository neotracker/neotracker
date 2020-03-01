/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { LinearProgress, withStyles } from '../../../lib/base';
import { Logo } from '../logo';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('md')]: {
    padding: {
      paddingTop: theme.spacing.unit * 2,
      paddingBottom: theme.spacing.unit * 2,
    },
  },
  [theme.breakpoints.up('md')]: {
    padding: {
      paddingTop: theme.spacing.unit * 3,
      paddingBottom: theme.spacing.unit * 3,
    },
  },
  root: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  padding: {},
  progress: {
    marginTop: theme.spacing.unit * 2,
    width: theme.spacing.unit * 16,
  },
});

type ExternalProps = {|
  disablePadding?: boolean,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PageLoading({
  disablePadding,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div
      className={classNames(classes.root, className, {
        [classes.padding]: !disablePadding,
      })}
    >
      <Logo width={48} height={56} />
      <LinearProgress className={classes.progress} />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(PageLoading): React.ComponentType<ExternalProps>);

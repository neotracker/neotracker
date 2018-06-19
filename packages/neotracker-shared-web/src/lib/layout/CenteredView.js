/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../styles/createTheme';
import { Grid, withStyles } from '../base';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      padding: theme.spacing.unit * 2,
    },
  },
  root: {
    margin: 0,
    width: '100%',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: 1200,
    width: '100%',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
});

type ExternalProps = {|
  children?: any,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function CenteredView({
  children,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <Grid
      className={classNames(className, classes.root)}
      container
      spacing={0}
      justify="center"
    >
      <Grid className={classes.gridItem} item xs={12} sm={12} md={10}>
        <div className={classes.col}>{children}</div>
      </Grid>
    </Grid>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(CenteredView): React.ComponentType<ExternalProps>);

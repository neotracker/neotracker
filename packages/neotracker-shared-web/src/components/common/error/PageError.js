/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Card, Grid, withStyles } from '../../../lib/base';

import ErrorView from './ErrorView';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('md')]: {
    root: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('md')]: {
    root: {
      padding: theme.spacing.unit * 2,
    },
  },
  root: {
    margin: 0,
    width: '100%',
  },
  cardContainer: {
    maxWidth: 456,
  },
});

type ExternalProps = {|
  error: Error,
  retry: ?() => void,
  allowRetry?: boolean,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PageError({
  error,
  retry,
  allowRetry,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <Grid
      className={classNames(classes.root, className)}
      container
      justify="center"
      spacing={16}
    >
      <Grid className={classes.cardContainer} item xs={12} sm={8}>
        <Card>
          <ErrorView error={error} retry={retry} allowRetry={!!allowRetry} />
        </Card>
      </Grid>
    </Grid>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(PageError): React.ComponentType<ExternalProps>);

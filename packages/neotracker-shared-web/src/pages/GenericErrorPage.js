/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Card, Grid, Typography, withStyles } from '../lib/base';

const styles = () => ({
  root: {
    padding: 16,
  },
  card: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 24,
  },
  headline: {
    paddingBottom: 8,
  },
});

type ExternalProps = {||};
type Props = {|
  classes: Object,
|};
const GenericErrorPage = ({ classes }: Props) => (
  <div>
    <Helmet>
      <title>{'Something Went Wrong'}</title>
    </Helmet>
    <Grid className={classes.root} container justify="center">
      <Grid item xs={12} md={8} lg={4}>
        <Card className={classes.card}>
          <Typography variant="headline" className={classes.headline}>
            Something went wrong!
          </Typography>
          <Typography variant="subheading">
            Try going back to where you were or heading to the home page.
          </Typography>
        </Card>
      </Grid>
    </Grid>
  </div>
);

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(GenericErrorPage): React.ComponentType<ExternalProps>);

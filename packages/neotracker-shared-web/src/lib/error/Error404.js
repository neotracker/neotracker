/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import { type HOC, compose, pure } from 'recompose';
import Helmet from 'react-helmet';
import * as React from 'react';

import { Card, Grid, Typography, withStyles } from '../base';

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

type Props = {|
  classes: Object,
|};
const Error404 = ({ classes }: Props) => (
  <div>
    <Helmet>
      <title>{'404'}</title>
    </Helmet>
    <Grid className={classes.root} container justify="center">
      <Grid item xs={12} md={8} lg={4}>
        <Card className={classes.card}>
          <Typography variant="headline" className={classes.headline}>
            Sorry, that page was not found.
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

export default enhance(Error404);

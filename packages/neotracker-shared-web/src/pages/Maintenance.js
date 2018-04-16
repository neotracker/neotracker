/* @flow */
/* eslint-disable react/jsx-curly-brace-presence */
import Helmet from 'react-helmet';
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { Card, Grid, Typography, withStyles } from '../lib/base';
import { Link } from '../lib/link';
import { Logo } from '../components/common/logo';

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
  link: {
    display: 'inline',
  },
});

type ExternalProps = {||};
type Props = {|
  classes: Object,
|};
const GenericErrorPage = ({ classes }: Props) => (
  <div>
    <Helmet>
      <title>{'Maintenance'}</title>
    </Helmet>
    <Grid className={classes.root} container justify="center">
      <Grid item xs={12} md={8} lg={4}>
        <Card className={classes.card}>
          <Logo id="PageLoading" width={48} height={56} />
          <Typography variant="headline" className={classes.headline}>
            Down for Maintenance
          </Typography>
          <Typography variant="subheading">
            NEO Tracker is currently down for maintenance.
          </Typography>
          <Typography variant="body1">
            Follow us on{' '}
            <Link
              className={classes.link}
              path="https://twitter.com/neotrackerio"
              title="Twitter"
              absolute
              newTab
            />{' '}
            for updates.
          </Typography>
        </Card>
      </Grid>
    </Grid>
  </div>
);

const enhance: HOC<*, *> = compose(withStyles(styles), pure);

export default (enhance(GenericErrorPage): React.ComponentType<ExternalProps>);

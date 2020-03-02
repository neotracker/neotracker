/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { withRouter } from 'react-router';

import type { AppOptions } from '../../../AppContext';
import { type Theme } from '../../../styles/createTheme';
import { Typography, withStyles } from '../../../lib/base';

import DonateLink from './DonateLink';
import FacebookIcon from './FacebookIcon';
import SocialLink from './SocialLink';
import TwitterIcon from './TwitterIcon';

import { mapAppOptions } from '../../../utils';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
  },
  root: {
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
  },
  firstRow: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.unit,
  },
  secondRow: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '90%',
  },
  copyright: {
    color: theme.custom.colors.common.white,
  },
  icon: {
    fill: theme.custom.colors.common.white,
    paddingRight: theme.spacing.unit / 2,
  },
});

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  appOptions: AppOptions,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AppFooter({
  className,
  appOptions,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      <div className={classes.firstRow}>
        <div className={classes.col}>
          <DonateLink />
        </div>
        <div className={classes.col}>
          <SocialLink
            icon={<TwitterIcon className={classes.icon} />}
            title="Twitter"
            link={appOptions.meta.social.twitter}
          />
          <SocialLink
            icon={<FacebookIcon className={classes.icon} />}
            title="Facebook"
            link={appOptions.meta.social.fb}
          />
        </div>
      </div>
      <div className={classes.secondRow}>
        <Typography className={classes.copyright} variant="caption">
          {`${appOptions.meta.name} © 2020`}
        </Typography>
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withRouter,
  withStyles(styles),
  mapAppOptions,
  pure,
);

export default (enhance(AppFooter): React.ComponentType<ExternalProps>);

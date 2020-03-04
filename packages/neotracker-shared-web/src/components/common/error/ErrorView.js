/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Button, Typography, withStyles } from '../../../lib/base';
import { Logo } from '../logo';

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
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardContainer: {
    maxWidth: 456,
  },
  headline: {
    paddingBottom: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
  },
  retryArea: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  reloadButton: {
    marginTop: theme.spacing.unit,
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
});

type ExternalProps = {|
  error: ?Error,
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
function ErrorView({
  retry,
  allowRetry,
  className,
  classes,
}: Props): React.Element<*> {
  let content;
  if (allowRetry && retry != null) {
    content = (
      <div className={classes.retryArea}>
        <Typography variant="subheading">
          Try going back to where you were, refreshing the page, or clicking
          reload below.
        </Typography>
        <Button
          className={classes.reloadButton}
          onClick={retry}
          variant="contained"
          color="primary"
        >
          <Typography className={classes.buttonText} variant="body1">
            RELOAD
          </Typography>
        </Button>
      </div>
    );
  } else {
    content = (
      <Typography variant="subheading">
        Try going back to where you were or refreshing the page.
      </Typography>
    );
  }
  return (
    <div className={classNames(classes.root, className)}>
      <Logo width={48} height={56} />
      <Typography variant="headline" className={classes.headline}>
        Something went wrong!
      </Typography>
      {content}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(ErrorView): React.ComponentType<ExternalProps>);

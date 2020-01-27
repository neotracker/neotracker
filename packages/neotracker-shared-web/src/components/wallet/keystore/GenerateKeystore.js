/* @flow */
import { Link } from 'react-router-dom';
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Button, Typography, withStyles } from '../../../lib/base';

import * as routes from '../../../routes';

const styles = (theme: Theme) => ({
  link: {
    textDecoration: 'none',
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
});

type ExternalProps = {|
  replace?: boolean,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function GenerateKeystore({
  replace,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <Link
      className={classes.link}
      replace={!!replace}
      to={routes.WALLET_CREATE_KEYSTORE}
    >
      <Button className={className} variant="contained" color="primary">
        <Typography className={classes.buttonText} variant="body1">
          CREATE KEYSTORE
        </Typography>
      </Button>
    </Link>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(GenerateKeystore): React.ComponentType<ExternalProps>);

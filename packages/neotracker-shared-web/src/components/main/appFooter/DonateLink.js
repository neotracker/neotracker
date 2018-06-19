/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type AppOptions } from '../../../AppContext';
import { type Theme } from '../../../styles/createTheme';
import { AddressLink } from '../../explorer/address/lib';
import { Typography, withStyles } from '../../../lib/base';

import { mapAppOptions } from '../../../utils';

const styles = (theme: Theme) => ({
  root: {
    alignItems: 'center',
    display: 'flex',
  },
  donate: {
    marginRight: theme.spacing.unit,
  },
  text: {
    color: theme.custom.colors.common.white,
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
function DonateLink({
  className,
  appOptions,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      <Typography
        className={classNames(classes.text, classes.donate)}
        variant="body1"
      >
        Donate:
      </Typography>
      <AddressLink addressHash={appOptions.meta.donateAddress} white />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  mapAppOptions,
  pure,
);

export default (enhance(DonateLink): React.ComponentType<ExternalProps>);

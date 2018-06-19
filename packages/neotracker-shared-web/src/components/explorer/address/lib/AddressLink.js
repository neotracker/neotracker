/* @flow */
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../../styles/createTheme';
import { Link } from '../../../../lib/link';
import { Typography, withStyles } from '../../../../lib/base';

import * as routes from '../../../../routes';

const styles = (theme: Theme) => ({
  highlighted: {
    color: theme.palette.secondary.light,
    fontWeight: theme.typography.fontWeightRegular,
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

type ExternalProps = {|
  addressHash: string,
  highlighted?: boolean,
  white?: boolean,
  newTab?: boolean,
  component?: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AddressLink({
  addressHash,
  highlighted,
  white,
  newTab,
  component,
  className,
  classes,
}: Props): React.Element<any> {
  if (highlighted) {
    return (
      <Typography
        className={classes.highlighted}
        variant="body1"
        component={component}
      >
        {addressHash}
      </Typography>
    );
  }
  const path = routes.makeAddress(addressHash);
  return (
    <Link
      className={className}
      variant="body1"
      path={path}
      title={addressHash}
      white={white}
      newTab={newTab}
      component={component}
    />
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(AddressLink): React.ComponentType<ExternalProps>);

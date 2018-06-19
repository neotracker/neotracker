/* @flow */
import { Link as RRLink } from 'react-router-dom';
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { Icon, withStyles } from '../base';

const styles = (theme: any) => ({
  link: {
    color: theme.palette.text.secondary,
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.text.primary,
    },
  },
});

type ExternalProps = {|
  path: string,
  icon: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function IconLink({ path, icon, className, classes }: Props): React.Element<*> {
  return (
    <RRLink className={classes.link} to={path}>
      <Icon className={classNames(classes.link, className)}>{icon}</Icon>
    </RRLink>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(IconLink): React.ComponentType<ExternalProps>);

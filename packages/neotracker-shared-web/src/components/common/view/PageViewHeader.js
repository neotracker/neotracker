/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Icon, Typography, withStyles } from '../../../lib/base';
import { Link } from '../../../lib/link';

import * as routes from '../../../routes';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
      paddingTop: theme.spacing.unit,
    },
    leftHeader: {
      marginBottom: theme.spacing.unit,
      marginRight: theme.spacing.unit,
    },
    rightHeader: {
      marginBottom: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
      paddingTop: theme.spacing.unit * 2,
    },
    leftHeader: {
      marginBottom: theme.spacing.unit * 2,
      marginRight: theme.spacing.unit * 2,
    },
    rightHeader: {
      marginBottom: theme.spacing.unit * 2,
    },
  },
  [theme.breakpoints.down('md')]: {
    root: {
      flexWrap: 'wrap',
    },
  },
  [theme.breakpoints.up('md')]: {
    root: {
      flexWrap: 'nowrap',
    },
  },
  root: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  leftHeader: {
    alignItems: 'center',
    display: 'flex',
    flex: '0 1 auto',
    minWidth: '0',
  },
  rightHeader: {
    alignItems: 'center',
    display: 'flex',
  },
  static: {
    overflow: 'initial',
  },
  margin: {
    marginRight: theme.spacing.unit,
  },
  text: {
    color: theme.custom.colors.common.white,
  },
  link: {
    color: theme.custom.colors.common.white,
    textDecoration: 'underline',
    '&:hover': {
      color: theme.custom.colors.common.darkWhite,
    },
  },
  linkSelected: {
    color: theme.custom.colors.common.darkWhite,
    textDecoration: 'underline',
  },
  backgroundColor: {
    backgroundColor: theme.palette.primary.main,
  },
  id: {
    flex: '0 1 auto',
    minWidth: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

type ExternalProps = {|
  id: string,
  title: string,
  name: string,
  pluralName: string,
  searchRoute: string,
  icon?: string,
  backgroundColorClassName?: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
// TODO: INTL
function PageViewHeader({
  id,
  title,
  name,
  pluralName,
  searchRoute,
  icon,
  backgroundColorClassName,
  className,
  classes,
}: Props): React.Element<*> {
  const breadcrumbVariant = 'body1';
  const slash = (
    <Typography
      className={classNames(classes.text, classes.margin, classes.static)}
      variant={breadcrumbVariant}
    >
      /
    </Typography>
  );
  let iconElement = null;
  if (icon != null) {
    iconElement = (
      <Icon className={classNames(classes.margin, classes.text)}>{icon}</Icon>
    );
  }
  return (
    <div
      className={classNames(
        classes.root,
        className,
        backgroundColorClassName == null
          ? classes.backgroundColor
          : backgroundColorClassName,
      )}
    >
      <div className={classes.leftHeader}>
        {iconElement}
        <Typography
          className={classNames(classes.margin, classes.text)}
          component="h1"
          variant="title"
        >
          {title}
        </Typography>
        <Typography
          className={classNames(classes.text, classes.id)}
          variant="body2"
        >
          {id}
        </Typography>
      </div>
      <div className={classes.rightHeader}>
        <Link
          className={classNames(classes.link, classes.margin, classes.static)}
          variant={breadcrumbVariant}
          path={routes.HOME}
          title="Home"
        />
        {slash}
        <Link
          className={classNames(classes.link, classes.margin, classes.static)}
          variant={breadcrumbVariant}
          path={searchRoute}
          title={pluralName}
        />
        {slash}
        <Typography
          className={classNames(classes.linkSelected, classes.static)}
          variant={breadcrumbVariant}
        >
          {name}
        </Typography>
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(withStyles(styles), pure);

export default (enhance(PageViewHeader): React.ComponentType<ExternalProps>);

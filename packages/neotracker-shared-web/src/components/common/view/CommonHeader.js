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
    },
    rightHeader: {
      marginBottom: theme.spacing.unit * 2,
    },
  },
  root: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  leftHeader: {
    alignItems: 'center',
    display: 'flex',
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
    backgroundColor: theme.palette.primary[500],
  },
});

type ExternalProps = {|
  id?: string,
  title?: string,
  name: string,
  pluralName: string,
  searchRoute?: string,
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
function CommonHeader({
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

  let idElement = null;
  let infoElement = null;
  let searchElement = (
    <Typography
      className={classNames(classes.linkSelected, classes.static)}
      variant={breadcrumbVariant}
    >
      {pluralName}
    </Typography>
  );
  if (id != null && searchRoute != null) {
    idElement = (
      <Typography className={classes.text} variant="body2">
        {id}
      </Typography>
    );
    searchElement = (
      <Link
        className={classNames(classes.link, classes.margin, classes.static)}
        variant={breadcrumbVariant}
        path={searchRoute}
        title={pluralName}
      />
    );
    infoElement = (
      <Typography
        className={classNames(classes.linkSelected, classes.static)}
        variant={breadcrumbVariant}
      >
        {name} Information
      </Typography>
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
          {title == null ? pluralName : title}
        </Typography>
        {idElement}
      </div>
      <div className={classes.rightHeader}>
        <Link
          className={classNames(classes.link, classes.margin, classes.static)}
          variant={breadcrumbVariant}
          path={routes.HOME}
          title="Home"
        />
        {slash}
        {searchElement}
        {infoElement == null ? null : slash}
        {infoElement}
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(CommonHeader): React.ComponentType<ExternalProps>);

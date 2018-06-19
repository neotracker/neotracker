/* @flow */
import { Link as RRLink } from 'react-router-dom';
import * as React from 'react';
import type { Variant } from '@material-ui/core/Typography';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { Typography, withStyles } from '../base';

const styles = (theme: any) => ({
  commonLink: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  link: {
    color: theme.palette.primary[500],
    fontWeight: theme.typography.fontWeightRegular,
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.primary[700],
      textDecoration: 'underline',
    },
  },
  linkWhite: {
    color: theme.custom.colors.common.white,
    fontWeight: theme.typography.fontWeightRegular,
    textDecoration: 'underline',
    '&:hover': {
      color: theme.custom.colors.common.darkWhite,
      textDecoration: 'underline',
    },
  },
});

type ExternalProps = {|
  path: string,
  title: string | React.Element<any>,
  variant?: Variant,
  component?: string,
  white?: boolean,
  absolute?: boolean,
  newTab?: boolean,
  onClick?: () => void,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Link({
  path,
  title,
  variant: variantIn,
  component,
  white,
  absolute,
  newTab,
  onClick,
  className,
  classes,
}: Props): React.Element<any> {
  const variant = variantIn || 'body1';
  const classNameLink = classNames(
    {
      [classes.link]: !white,
      [classes.linkWhite]: !!white,
    },
    classes.commonLink,
  );
  let linkText;
  if (typeof title === 'string') {
    linkText = (
      <Typography
        variant={variant}
        component={component}
        className={classNames(classNameLink, className)}
      >
        {title}
      </Typography>
    );
  } else {
    linkText = React.cloneElement(
      title,
      {
        ...title.props,
        className: classNames(classNameLink, className, title.props.className),
      },
      title.props.children,
    );
  }

  if (absolute || path.startsWith('http') || newTab) {
    return (
      <a
        className={classNameLink}
        href={path}
        target={newTab ? '_blank' : undefined}
        onClick={onClick}
      >
        {linkText}
      </a>
    );
  }

  return (
    <RRLink className={classNameLink} to={path} onClick={onClick}>
      {linkText}
    </RRLink>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(Link): React.ComponentType<ExternalProps>);

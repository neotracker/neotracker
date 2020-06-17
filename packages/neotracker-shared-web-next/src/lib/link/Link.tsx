import { TypographyVariant } from '@material-ui/core/styles';
import * as React from 'react';
import { Link as RRLink } from 'react-router-dom';
import styled from 'styled-components';
import { prop } from 'styled-tools';
import { Typography as MuiTypography } from '../base';

// commonLink: {
//   overflow: 'hidden',
//   textOverflow: 'ellipsis',
//   whiteSpace: 'nowrap',
// },
// link: {
//   color: theme.palette.secondary.main,
//   fontWeight: theme.typography.fontWeightRegular,
//   textDecoration: 'none',
//   '&:hover': {
//     color: theme.palette.secondary.dark,
//     textDecoration: 'underline',
//   },
// },
// linkWhite: {
//   color: theme.custom.colors.common.white,
//   fontWeight: theme.typography.fontWeightRegular,
//   textDecoration: 'underline',
//   '&:hover': {
//     color: theme.custom.colors.common.darkWhite,
//     textDecoration: 'underline',
//   },
// },

const Typography = styled(MuiTypography)<any>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  .link {
    color: ${prop('theme.palette.seconday.main')};
    font-weight: ${prop('theme.typography.fontWeightRegular')};
    text-decoration: none;
    &:hover {
      color: ${prop('theme.palette.secondary.dark')};
      text-decoration: underline;
    }
  }
  .linkWhite {
    color: ${prop('theme.custom.colors.common.white')};
    font-weight: ${prop('theme.typography.fontWeightRegular')};
    text-decoration: underline;
    &:hover {
      color: ${prop('theme.palette.secondary.darkWhite')};
      text-decoration: underline;
    }
  }
`;

interface Props {
  readonly path: string;
  readonly title: string | React.ReactElement;
  readonly variant?: TypographyVariant;
  readonly component?: string;
  readonly white?: boolean;
  readonly absolute?: boolean;
  readonly newTab?: boolean;
  readonly onClick?: () => void;
}

export const Link = ({ path, title, variant: variantIn, component, white, absolute, newTab, onClick }: Props) => {
  const variant = variantIn === undefined ? 'body1' : variantIn;
  const classNameLink = `commonLink ${!white ? 'link' : ''} ${!!white ? 'linkWhite' : ''}`;
  // const classNameLink = classNames(
  //   {
  //     [classes.link]: !white,
  //     [classes.linkWhite]: !!white,
  //   },
  //   classes.commonLink,
  // );
  let linkText;
  if (typeof title === 'string') {
    linkText = (
      <Typography variant={variant} component={component} className={classNameLink}>
        {title}
      </Typography>
    );
  } else {
    linkText = React.cloneElement(
      title,
      {
        ...title.props,
        className: `${classNameLink} ${title.props.className}`,
      },
      title.props.children,
    );
  }

  if (absolute || path.startsWith('http') || newTab) {
    return (
      <a className={classNameLink} href={path} target={newTab ? '_blank' : undefined} onClick={onClick}>
        {linkText}
      </a>
    );
  }

  return (
    <RRLink className={classNameLink} to={path} onClick={onClick}>
      {linkText}
    </RRLink>
  );
};

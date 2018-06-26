/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import classNames from 'classnames';
import markdown from 'markdown-it';

import { withStyles } from '../base';

const styles = (theme) => {
  const headerMargins = {
    marginTop: 16,
    marginBottom: 16,
  };
  return {
    root: {
      ...theme.typography.body1,
      overflowWrap: 'break-word',
      '& h1': {
        ...headerMargins,
        ...theme.typography.headline,
      },
      '& h2': {
        ...headerMargins,
        ...theme.typography.title,
      },
      '& h3': {
        ...headerMargins,
        ...theme.typography.subheading,
      },
      '& h4': {
        ...headerMargins,
        ...theme.typography.body2,
      },
      '& h5': {
        ...headerMargins,
        ...theme.typography.body1,
      },
      '& h6': {
        ...headerMargins,
        ...theme.typography.caption,
      },
      '& p': {
        marginBottom: 8,
        marginTop: 8,
      },
      '& a': {
        color: theme.palette.secondary[500],
      },
      '& hr': {
        border: 'none',
        borderBottom: `1px solid ${theme.custom.lightDivider}`,
        marginBottom: 8,
        marginTop: 8,
      },
      '& strong': {
        fontWeight: theme.typography.fontWeightMedium,
      },
      '& blockquote': {
        borderLeft: `5px solid ${theme.palette.text.divider}`,
        marginBottom: 16,
        marginLeft: 0,
        marginRight: 24,
        marginTop: 16,
        paddingLeft: 16,
      },
      '& ul': {
        marginBottom: 8,
        marginTop: 8,
        paddingLeft: 24,
      },
      '& ol': {
        marginBottom: 8,
        marginTop: 8,
        paddingLeft: 24,
      },
      '& pre': {
        marginBottom: 16,
        marginTop: 16,
        whiteSpace: 'pre-wrap',
      },
    },
  };
};

export const mdOptions = {
  html: false,
  xhtmlOut: false,
  breaks: false,
  langPrefix: 'language-',
  linkify: true,
  typographer: true,
  quotes: `""''`,
};

const defaultMD = markdown().set(mdOptions);

type ExternalProps = {|
  source: string,
  'data-test'?: string,
  md?: markdown,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Markdown({
  source,
  md: externalMD,
  className,
  classes,
  'data-test': dataTest,
}: Props): React.Element<*> {
  const md = externalMD || defaultMD;
  return (
    <div
      data-test={dataTest}
      className={classNames(classes.root, className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: md.render(source) }}
    />
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(Markdown): React.ComponentType<ExternalProps>);

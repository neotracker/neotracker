/* @flow */
import * as React from 'react';
import type { Variant } from '@material-ui/core/Typography';

import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../styles/createTheme';
import { Card, Typography, withStyles } from '../base';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    header: {
      padding: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    header: {
      padding: theme.spacing.unit * 2,
    },
  },
  header: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
    display: 'flex',
  },
});

type ExternalProps = {|
  title: string,
  extra?: React.Element<any>,
  titleComponent?: string,
  titleVariant?: Variant,
  children?: any,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TitleCard({
  title,
  children,
  titleComponent: titleComponentIn,
  titleVariant: titleVariantIn,
  className,
  classes,
}: Props): React.Element<*> {
  const titleComponent = titleComponentIn == null ? 'h1' : titleComponentIn;
  const titleVariant = titleVariantIn == null ? 'title' : titleVariantIn;
  return (
    <Card className={className}>
      <div className={classes.header}>
        <Typography component={titleComponent} variant={titleVariant}>
          {title}
        </Typography>
      </div>
      {children}
    </Card>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(TitleCard): React.ComponentType<ExternalProps>);

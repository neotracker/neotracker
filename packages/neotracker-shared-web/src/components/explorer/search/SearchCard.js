/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import { Card, Typography, withStyles } from '../../../lib/base';

import SearchField from './SearchField';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    content: {
      padding: theme.spacing.unit,
    },
    cardHeader: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    content: {
      padding: theme.spacing.unit * 2,
    },
    cardHeader: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
  },
  content: {},
});

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SearchCard({ className, classes }: Props): React.Element<*> {
  return (
    <Card className={classNames(className, classes.root)}>
      <div className={classes.cardHeader}>
        <Typography variant="title" component="h1">
          Blockchain Explorer
        </Typography>
      </div>
      <div className={classes.content}>
        <SearchField />
      </div>
    </Card>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(SearchCard): React.ComponentType<ExternalProps>);

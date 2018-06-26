/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withState,
  withProps,
} from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import {
  Card,
  Collapse,
  IconButton,
  Typography,
  withStyles,
} from '../../../lib/base';
import { Chevron } from '../../../lib/animated';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      marginTop: theme.spacing.unit,
    },
    padding: {
      paddingBottom: theme.spacing.unit,
      paddingTop: theme.spacing.unit,
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      marginTop: theme.spacing.unit * 2,
    },
    padding: {
      paddingBottom: theme.spacing.unit * 2,
      paddingTop: theme.spacing.unit * 2,
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
  },
  root: {},
  header: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  content: {
    borderTop: `1px solid ${theme.custom.lightDivider}`,
  },
  padding: {},
  // TODO: Keep in sync with TransactionSummaryHeader and/or extract out
  chevronButton: {
    width: theme.spacing.unit * 5,
    height: theme.spacing.unit * 5,
    marginBottom: -theme.spacing.unit,
    marginRight: -theme.spacing.unit,
    marginTop: -theme.spacing.unit,
  },
});

type ExternalProps = {|
  title: string,
  content: React.Element<any>,
  initialShowContent?: boolean,
  className?: string,
|};
type InternalProps = {|
  showContent: boolean,
  onShowContent: () => void,
  onHideContent: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ExpandoCard({
  title,
  content,
  className,
  showContent,
  onShowContent,
  onHideContent,
  classes,
}: Props): React.Element<*> {
  const onClickChevron = showContent ? onHideContent : onShowContent;
  return (
    <Card className={classNames(className, classes.root)}>
      <div
        role="presentation"
        className={classNames(classes.header, classes.padding)}
        onClick={onClickChevron}
      >
        <Typography variant="title">{title}</Typography>
        <IconButton className={classes.chevronButton} onClick={onClickChevron}>
          <Chevron up={!showContent} />
        </IconButton>
      </div>
      <Collapse in={showContent} timeout="auto">
        <div className={classes.content}>{content}</div>
      </Collapse>
    </Card>
  );
}

const enhance: HOC<*, *> = compose(
  withState('state', 'setState', ({ initialShowContent }) => ({
    showContent: initialShowContent || false,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onShowContent: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        showContent: true,
      })),
    onHideContent: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        showContent: false,
      })),
  }),
  withStyles(styles),
  pure,
);

export default (enhance(ExpandoCard): React.ComponentType<ExternalProps>);

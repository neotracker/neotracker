/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../../styles/createTheme';
import {
  CircularProgress,
  Icon,
  Typography,
  withStyles,
} from '../../../lib/base';
import { Tooltip } from '../../../lib/tooltip';
import { TransactionLink } from '../../explorer/transaction/lib';
import { Help } from '../../../lib/help';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    alignItems: 'center',
    display: 'flex',
  },
  hash: {
    marginLeft: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit / 2,
  },
  done: {
    color: theme.palette.primary[700],
  },
  inProgress: {
    color: theme.palette.primary[500],
  },
  tooltip: {
    cursor: 'pointer',
  },
  failed: {
    color: theme.palette.error[500],
  },
  margin: {
    marginRight: theme.spacing.unit,
  },
});

type ExternalProps = {|
  stepDescription: string,
  tooltip: string,
  done: boolean,
  inProgress: boolean,
  error: ?string,
  transactionHash?: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function ClaimGASStep({
  stepDescription,
  tooltip,
  done,
  inProgress,
  error,
  transactionHash,
  className,
  classes,
}: Props): React.Element<*> {
  let errorElement;
  if (error != null) {
    errorElement = (
      <Tooltip
        className={classNames(classes.tooltip, classes.margin)}
        title={error}
        position="bottom"
      >
        <Icon className={classes.failed}>warning</Icon>
      </Tooltip>
    );
  }

  let hashElement;
  if (transactionHash != null) {
    hashElement = (
      <TransactionLink
        className={classes.hash}
        transactionHash={transactionHash}
      />
    );
  }

  let checkElement;
  if (done) {
    checkElement = (
      <Icon className={classNames(classes.done, classes.margin)}>
        check_circle
      </Icon>
    );
  }

  let loadingElement;
  if (inProgress) {
    loadingElement = (
      <CircularProgress className={classes.margin} size={24} thickness={5} />
    );
  }

  const color = classNames({
    [classes.done]: done,
    [classes.inProgress]: inProgress,
    [classes.failed]: error != null,
  });
  return (
    <div className={classNames(className, classes.root)}>
      <div className={classes.main}>
        <Typography
          className={classNames(color, classes.margin)}
          variant="body1"
        >
          {stepDescription}
        </Typography>
        {checkElement}
        {errorElement}
        {loadingElement}
        <Help className={color} tooltip={tooltip} />
      </div>
      {hashElement}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(ClaimGASStep): React.ComponentType<ExternalProps>);

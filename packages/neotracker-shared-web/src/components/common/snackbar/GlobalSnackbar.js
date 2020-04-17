/* @flow */
import * as React from 'react';

import {
  type HOC,
  compose,
  lifecycle,
  pure,
  withHandlers,
  withProps,
  withState,
} from 'recompose';
import { connect } from 'react-redux';

import { type Theme } from '../../../styles/createTheme';
import { Icon, IconButton, Snackbar, withStyles } from '../../../lib/base';

import { type SnackbarProps, selectSnackbarProps } from '../../../redux';

const styles = (theme: Theme) => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4,
  },
  closeIcon: {
    color: 'inherit',
  },
});

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  currentSnackbarProps: SnackbarProps,
  open: boolean,
  handleClose: () => void,
  handleExited: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function GlobalSnackbar({
  className,
  currentSnackbarProps,
  open,
  handleClose,
  handleExited,
  classes,
}: Props): React.Element<*> {
  return (
    <Snackbar
      className={className}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      message={
        <span>
          {currentSnackbarProps != null ? currentSnackbarProps.message : ''}
        </span>
      }
      action={
        <div>
          {currentSnackbarProps != null && currentSnackbarProps.action}
          {currentSnackbarProps != null &&
          currentSnackbarProps.omitClose ? null : (
            <IconButton
              className={classes.close}
              aria-label="Close"
              color="inherit"
              onClick={handleClose}
            >
              <Icon className={classes.closeIcon}>close</Icon>
            </IconButton>
          )}
        </div>
      }
      onClose={handleClose}
      onExited={handleExited}
      open={currentSnackbarProps != null && open}
    />
  );
}

const enhance: HOC<*, *> = compose(
  withState('state', 'setState', {
    open: false,
    currentSnackbarProps: null,
    snackbarPropsQueue: [],
    timer: null,
  }),
  withProps(({ state }) => state),
  connect((state) => ({
    snackbarProps: selectSnackbarProps(state),
  })),
  withHandlers({
    handleClose: ({ setState }) => () => {
      setState((prevState) => {
        if (prevState.timer) {
          clearTimeout(prevState.timer);
        }
        return {
          ...prevState,
          open: false,
        };
      });
    },
  }),
  withHandlers({
    handleExited: ({ setState, handleClose }) => () => {
      setState((prevState) => {
        if (prevState.snackbarPropsQueue.length > 0) {
          const [
            currentSnackbarProps,
            ...snackbarPropsQueue
          ] = prevState.snackbarPropsQueue;
          return {
            ...prevState,
            open: true,
            currentSnackbarProps,
            snackbarPropsQueue,
            timer: setTimeout(
              () => handleClose(),
              currentSnackbarProps.timeoutMS || 2000,
            ),
          };
        }

        return {
          ...prevState,
          open: false,
          currentSnackbarProps: null,
        };
      });
    },
  }),
  lifecycle({
    componentDidUpdate(prevProps) {
      if (
        this.props.snackbarProps !== prevProps.snackbarProps &&
        this.props.snackbarProps != null
      ) {
        if (
          this.props.snackbarPropsQueue.length === 0 &&
          this.props.currentSnackbarProps == null
        ) {
          this.props.setState((prevState) => ({
            ...prevState,
            open: true,
            currentSnackbarProps: this.props.snackbarProps,
            timer: setTimeout(
              () => this.props.handleClose(),
              this.props.snackbarProps.timeoutMS || 2000,
            ),
          }));
        } else {
          this.props.setState((prevState) => ({
            ...prevState,
            snackbarPropsQueue: [
              ...prevState.snackbarPropsQueue,
              this.props.snackbarProps,
            ],
          }));
        }
      }
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(GlobalSnackbar): React.ComponentType<ExternalProps>);

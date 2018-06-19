/* @flow */
import MUIDialog, { type DialogProps } from '@material-ui/core/Dialog';
import * as React from 'react';

import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../styles/createTheme';

import withStyles from './withStyles';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('xs')]: {
    xs: {
      margin: 0,
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      maxHeight: '100%',
      borderRadius: 0,
    },
  },
  [theme.breakpoints.down('sm')]: {
    sm: {
      margin: 0,
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      maxHeight: '100%',
      borderRadius: 0,
    },
  },
  [theme.breakpoints.down('md')]: {
    md: {
      margin: 0,
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      maxHeight: '100%',
      borderRadius: 0,
    },
  },
  xs: {},
  sm: {},
  md: {},
});

type ExternalProps = {|
  ...DialogProps,
  maxWidth?: 'xs' | 'sm' | 'md',
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {
  ...ExternalProps,
  ...InternalProps,
};
function Dialog({
  className,
  maxWidth,
  classes,
  ...props
}: Props): React.Element<*> {
  let muiClasses;
  if (maxWidth != null) {
    muiClasses = {
      paper: classes[maxWidth],
    };
  }
  return (
    <MUIDialog
      disableBackdropClick={props.disableBackdropClick}
      disableEscapeKeyDown={props.disableEscapeKeyDown}
      fullScreen={props.fullScreen}
      fullWidth={props.fullWidth}
      onBackdropClick={props.onBackdropClick}
      onClose={props.onClose}
      onEnter={props.onEnter}
      onEntered={props.onEntered}
      onEntering={props.onEntering}
      onEscapeKeyDown={props.onEscapeKeyDown}
      onExit={props.onExit}
      onExited={props.onExited}
      onExiting={props.onExiting}
      open={props.open}
      PaperProps={props.PaperProps}
      TransitionComponent={props.TransitionComponent}
      transitionDuration={props.transitionDuration}
      className={className}
      classes={muiClasses}
      maxWidth={maxWidth}
    >
      {props.children}
    </MUIDialog>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(Dialog): React.ComponentType<ExternalProps>);

// tslint:disable-next-line: match-default-export-name
import MUIDialog, { DialogProps } from '@material-ui/core/Dialog';
import React from 'react';
import styled, { css } from 'styled-components';
import { prop, switchProp } from 'styled-tools';

const DialogReturn = styled(MUIDialog)`
  ${switchProp('maxWidth', {
    xs: css`
      @media (max-width: ${prop('theme.breakpoints.xs')}) {
        margin: 0;
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
      }
    `,
    sm: css`
      @media (max-width: ${prop('theme.breakpoints.sm')}) {
        margin: 0;
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
      }
    `,
    md: css`
      @media (max-width: ${prop('theme.breakpoints.md')}) {
        margin: 0;
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
      }
    `,
  })}
`;

interface Props extends DialogProps {
  readonly maxWidth?: 'xs' | 'sm' | 'md';
}

export const Dialog = ({ maxWidth, ...props }: Props) => (
  <DialogReturn
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
    maxWidth={maxWidth}
  >
    {props.children}
  </DialogReturn>
);

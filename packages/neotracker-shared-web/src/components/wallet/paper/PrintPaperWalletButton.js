/* @flow */
import * as React from 'react';

import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import { connect } from 'react-redux';
// $FlowFixMe
import { sanitizeError } from '@neotracker/shared-utils';

import { type Theme } from '../../../styles/createTheme';
import { Button, Typography, withStyles } from '../../../lib/base';

import createPaperWallet from './createPaperWallet';
import { setSnackbar } from '../../../redux';

const styles = (theme: Theme) => ({
  buttonText: {
    color: theme.custom.colors.common.white,
  },
});

type ExternalProps = {|
  privateKey: string,
  address: string,
  onPrint?: () => void,
  className?: string,
|};
type InternalProps = {|
  onPrintPaperWallet: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PrintPaperWalletButton({
  className,
  onPrintPaperWallet,
  classes,
}: Props): React.Element<*> {
  return (
    <Button
      className={className}
      variant="contained"
      color="primary"
      onClick={onPrintPaperWallet}
    >
      <Typography className={classes.buttonText} variant="body1">
        PRINT PAPER WALLET
      </Typography>
    </Button>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  withStyles(styles, { withTheme: true }),
  connect(
    null,
    (dispatch) => ({
      showSnackbarError: ({ error }) =>
        dispatch(setSnackbar({ message: sanitizeError(error).clientMessage })),
    }),
  ),
  withHandlers({
    onPrintPaperWallet: ({
      onPrint,
      privateKey,
      address,
      theme,
      showSnackbarError,
      appContext,
    }) => () => {
      createPaperWallet({
        privateKey,
        address,
        theme,
        showSnackbarError,
        appContext,
      });
      if (onPrint != null) {
        onPrint();
      }
    },
  }),
  pure,
);

export default (enhance(
  PrintPaperWalletButton,
): React.ComponentType<ExternalProps>);

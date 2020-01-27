/* @flow */
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
// $FlowFixMe
import { ClientError, sanitizeError } from '@neotracker/shared-utils';
import * as React from 'react';

import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import { connect } from 'react-redux';

import type { AppContext } from '../../../AppContext';
import { type Theme } from '../../../styles/createTheme';
import { Button, Typography, withStyles } from '../../../lib/base';

import { setSnackbar } from '../../../redux';

const styles = (theme: Theme) => ({
  buttonText: {
    color: theme.custom.colors.common.white,
  },
});

type ExternalProps = {|
  nep2: string,
  filename: string,
  onError: () => void,
  onSave?: (event: SyntheticMouseEvent<>) => void,
  className?: string,
|};
type InternalProps = {|
  onClickSave: (event: Object) => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SaveKeystoreFileBlob({
  className,
  onClickSave,
  classes,
}: Props): React.Element<*> {
  return (
    <Button
      className={className}
      onClick={onClickSave}
      variant="contained"
      color="primary"
    >
      <Typography className={classes.buttonText} variant="body1">
        DOWNLOAD ENCRYPTED KEY
      </Typography>
    </Button>
  );
}

const enhance: HOC<*, *> = compose(
  getContext({
    appContext: () => null,
  }),
  connect(
    null,
    (dispatch) => ({
      showSnackbarError: ({ error }) =>
        dispatch(setSnackbar({ message: sanitizeError(error).clientMessage })),
    }),
  ),
  withHandlers({
    onClickSave: ({
      nep2,
      filename,
      onSave,
      appContext: appContextIn,
      onError,
      showSnackbarError,
    }) => (event) => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      try {
        webLogger.info({ title: 'neotracker_wallet_keystore_save_file' });
        const blob = new Blob([nep2], { type: 'text/plain;charset=utf-8' });
        appContext.fileSaver.saveAs(blob, filename);
      } catch (error) {
        webLogger.error({
          title: 'neotracker_wallet_keystore_save_file',
        });
        showSnackbarError({
          error: new ClientError(
            'Something went wrong saving the encrypted key file. Try again or try ' +
              'copying the encrypted key string to a file on your computer.',
          ),
        });
        onError();
      }
      if (onSave != null) {
        onSave(event);
      }
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  SaveKeystoreFileBlob,
): React.ComponentType<ExternalProps>);

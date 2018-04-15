/* @flow */
import { ClientError, sanitizeError } from 'neotracker-shared-utils';
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import * as React from 'react';

import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import {
  Button,
  CircularProgress,
  Typography,
  withStyles,
} from '../../../lib/base';
import { PasswordField } from '../common';
import { type Theme } from '../../../styles/createTheme';

import * as routes from '../../../routes';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    passwordField: {
      paddingTop: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    passwordField: {
      paddingTop: theme.spacing.unit * 2,
    },
  },
  root: {
    flex: '1 1 auto',
    maxWidth: theme.spacing.unit * 70,
  },
  passwordArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  passwordField: {
    flex: '1 1 auto',
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
  error: {
    color: theme.palette.error[500],
    paddingTop: theme.spacing.unit,
  },
  unlockArea: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  unlockButton: {
    marginLeft: theme.spacing.unit,
  },
  hidden: {
    display: 'none',
  },
});

type ExternalProps = {|
  fileTypeName: string,
  read: (reader: FileReader, file: any) => void,
  onUploadFileError: (error: Error) => void,
  extractWallet: (readerResult: string | Buffer) => any,
  unlockWallet: (wallet: any, password: string) => Promise<void>,
  onOpen: () => void,
  onOpenError: (error: Error) => void,
  className?: string,
|};
type InternalProps = {|
  wallet: ?mixed,
  error: ?string,
  loading: boolean,
  password: string,
  validation?: string,
  setUploadFileRef: (ref: any) => void,
  onClickUploadFile: () => void,
  onUploadFile: (event: Object) => void,
  onChange: (event: Object) => void,
  onSubmit: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function OpenWalletFilePassword({
  className,
  wallet,
  error,
  loading,
  password,
  validation,
  setUploadFileRef,
  onClickUploadFile,
  onUploadFile,
  onChange,
  onSubmit,
  classes,
}: Props): React.Element<*> {
  let errorElement;
  if (error != null) {
    errorElement = (
      <Typography className={classes.error} variant="body1">
        {error}
      </Typography>
    );
  }
  let passwordElement;
  if (wallet != null) {
    passwordElement = (
      <div className={classes.passwordArea}>
        <PasswordField
          id="owfp-password"
          className={classes.passwordField}
          value={password}
          validation={validation}
          onChange={onChange}
          onEnter={onSubmit}
          label="Enter password."
          hasSubtext
        />
        <div className={classes.unlockArea}>
          {loading ? <CircularProgress size={32} /> : null}
          <Button
            className={classes.unlockButton}
            color="primary"
            disabled={validation != null || loading}
            onClick={onSubmit}
          >
            <Typography color="inherit" variant="body1">
              UNLOCK
            </Typography>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={classNames(className, classes.root)}>
      <input
        className={classes.hidden}
        ref={setUploadFileRef}
        type="file"
        onChange={onUploadFile}
      />
      <Button variant="raised" color="primary" onClick={onClickUploadFile}>
        <Typography className={classes.buttonText} variant="body1">
          SELECT WALLET FILE
        </Typography>
      </Button>
      {errorElement}
      {passwordElement}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStateHandlers(
    () => ({
      uploadFileRef: null,
      wallet: null,
      error: null,
      password: '',
      validation: undefined,
      loading: false,
    }),
    { setState: prevState => updater => updater(prevState) },
  ),
  withRouter,
  withHandlers({
    setUploadFileRef: ({ setState }) => uploadFileRef =>
      setState(prevState => ({
        ...prevState,
        uploadFileRef,
      })),
    onClickUploadFile: ({ uploadFileRef }) => () => {
      if (uploadFileRef != null) {
        uploadFileRef.click();
      }
    },
    onUploadFile: ({
      setState,
      read,
      fileTypeName,
      extractWallet,
      onUploadFileError,
    }) => event => {
      if (event.target.files == null || event.target.files.length === 0) {
        return;
      }

      const onError = (error: Error) => {
        setState(prevState => ({
          ...prevState,
          error: `${fileTypeName} file upload failed${
            error instanceof ClientError ? `: ${error.clientMessage}` : '.'
          }`,
        }));
        onUploadFileError(error);
      };
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.error != null) {
          onError((reader.error: any));
        } else {
          try {
            const wallet = extractWallet(reader.result);
            setState(prevState => ({
              ...prevState,
              wallet,
              error: null,
            }));
          } catch (error) {
            onError(error);
          }
        }
      };
      try {
        read(reader, event.target.files[0]);
      } catch (error) {
        onError(error);
      }
    },
    onChange: ({ setState }) => event => {
      const password = event.target.value;
      setState(prevState => ({ ...prevState, password, validation: null }));
    },
    onSubmit: ({
      setState,
      wallet,
      password,
      history,
      fileTypeName,
      unlockWallet,
      onOpen,
      onOpenError,
    }) => () => {
      setState(prevState => ({
        ...prevState,
        loading: true,
      }));

      unlockWallet(wallet, password)
        .then(() => {
          history.replace(routes.WALLET_HOME);
          onOpen();
        })
        .catch(error => {
          setState(prevState => ({
            ...prevState,
            loading: false,
            validation:
              `Open ${fileTypeName} failed: ` +
              `${sanitizeError(error).clientMessage}`,
          }));
          onOpenError(error);
        });
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(OpenWalletFilePassword): React.ComponentType<
  ExternalProps,
>);

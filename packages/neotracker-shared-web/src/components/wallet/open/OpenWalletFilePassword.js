/* @flow */
import { ClientError } from 'neotracker-shared-utils';
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import * as React from 'react';

import classNames from 'classnames';

import OpenWalletPassword from './OpenWalletPassword';
import { Button, Typography, withStyles } from '../../../lib/base';
import { type Theme } from '../../../styles/createTheme';

const styles = (theme: Theme) => ({
  root: {
    flex: '1 1 auto',
    maxWidth: theme.spacing.unit * 70,
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
  error: {
    color: theme.palette.error[500],
    paddingTop: theme.spacing.unit,
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
  setUploadFileRef,
  onClickUploadFile,
  onUploadFile,
  onOpen,
  onOpenError,
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
  const fileUploadElement = (
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
    </div>
  );
  return (
    <OpenWalletPassword
      className={classNames(className, classes.root)}
      accessType="Keystore"
      keyElement={fileUploadElement}
      onOpen={onOpen}
      onOpenError={onOpenError}
      wallet={wallet}
    />
  );
}

const enhance: HOC<*, *> = compose(
  withStateHandlers(
    () => ({
      uploadFileRef: null,
      error: undefined,
      wallet: null,
    }),
    { setState: prevState => updater => updater(prevState) },
  ),
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
            const wallet = extractWallet((reader.result: $FlowFixMe));
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
  }),
  withStyles(styles),
  pure,
);

export default (enhance(OpenWalletFilePassword): React.ComponentType<
  ExternalProps,
>);

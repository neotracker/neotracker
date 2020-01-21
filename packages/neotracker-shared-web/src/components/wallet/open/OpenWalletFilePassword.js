/* @flow */
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withStateHandlers,
  getContext,
} from 'recompose';
import * as React from 'react';

import classNames from 'classnames';

import OpenWalletPassword from './OpenWalletPassword';
import { Button, Typography, withStyles, TextField } from '../../../lib/base';
import { type Theme } from '../../../styles/createTheme';
import { Selector } from '../../../lib/selector';

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
  hiddenUsername: {
    height: '0px',
    width: '0px',
  },
  selector: {
    display: 'flex',
    flexDirection: 'column',
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
  wallet?: {|
    type: 'nep2',
    wallet: string,
    password?: string,
    address?: string,
  |},
  multipleWallets?: Array<{| address: string, nep2: string |}>,
  error: ?string,
  loading: boolean,
  password: string,
  validation?: string,
  setUploadFileRef: (ref: any) => void,
  onClickUploadFile: () => void,
  onUploadFile: (event: Object) => void,
  onChange: (event: Object) => void,
  onSubmit: () => void,
  onSelect: (option: ?Object) => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function OpenWalletFilePassword({
  className,
  wallet,
  multipleWallets,
  error,
  setUploadFileRef,
  onClickUploadFile,
  onUploadFile,
  onOpen,
  onOpenError,
  onSelect,
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
  let selectAccountElement;
  if (multipleWallets != null) {
    selectAccountElement = (
      <Selector
        className={classes.selector}
        id="select-account"
        selectText="Select Wallet"
        label="Select Wallet"
        options={multipleWallets.map((account) => ({
          id: account.nep2,
          text: account.address,
        }))}
        selectedID={wallet == null ? null : wallet.wallet}
        onSelect={onSelect}
      />
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
      <Button variant="contained" color="primary" onClick={onClickUploadFile}>
        <Typography className={classes.buttonText} variant="body1">
          SELECT WALLET FILE
        </Typography>
      </Button>
      {errorElement}
    </div>
  );
  const hiddenUsername = (
    <div className={classes.hiddenUsername}>
      <TextField
        id="username"
        type="text"
        value={wallet == null ? '' : wallet.wallet}
        autoComplete="username"
        noTabIndex
      />
    </div>
  );
  return (
    <OpenWalletPassword
      className={classNames(className, classes.root)}
      accessType="Keystore"
      keyElement={fileUploadElement}
      selectAccountElement={selectAccountElement}
      hiddenUsernameElement={hiddenUsername}
      onOpen={onOpen}
      onOpenError={onOpenError}
      wallet={wallet}
    />
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  withStateHandlers(
    () => ({
      uploadFileRef: null,
      error: undefined,
      wallet: undefined,
      multipleWallets: null,
    }),
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  withHandlers({
    setUploadFileRef: ({ setState }) => (uploadFileRef) =>
      setState((prevState) => ({
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
    }) => (event) => {
      if (event.target.files == null || event.target.files.length === 0) {
        return;
      }

      const onError = (error: Error) => {
        setState((prevState) => ({
          ...prevState,
          error: `${fileTypeName} file upload failed. Invalid wallet file.`,
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
            if (wallet.type === 'nep2Array') {
              setState((prevState) => ({
                ...prevState,
                multipleWallets: wallet.wallet,
                wallet: null,
              }));
              return;
            }
            setState((prevState) => ({
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
    onSelect: ({ setState }) => (option) => {
      setState((prevState) => ({
        ...prevState,
        wallet:
          option.id == null
            ? null
            : { type: 'nep2', wallet: option.id, address: option.text },
      }));
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(
  OpenWalletFilePassword,
): React.ComponentType<ExternalProps>);

/* @flow */
import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import * as React from 'react';

import type { AppContext } from '../../../AppContext';
import { api as walletAPI } from '../../../wallet';

import OpenWalletFilePassword from './OpenWalletFilePassword';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  read: (reader: FileReader, file: any) => void,
  onUploadFileError: (error: Error) => void,
  extractWallet: (readerResult: string | Buffer) => any,
  unlockWallet: (wallet: any, password: string) => Promise<void>,
  onOpen: () => void,
  onOpenError: (error: Error) => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function OpenWalletKeystore({
  className,
  read,
  onUploadFileError,
  extractWallet,
  unlockWallet,
  onOpen,
  onOpenError,
}: Props): React.Element<*> {
  return (
    <OpenWalletFilePassword
      className={className}
      fileTypeName="Keystore"
      read={read}
      onUploadFileError={onUploadFileError}
      extractWallet={extractWallet}
      unlockWallet={unlockWallet}
      onOpen={onOpen}
      onOpenError={onOpenError}
    />
  );
}

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  (withHandlers({
    read: () => (reader, file) => reader.readAsText(file),
    onUploadFileError: ({ appContext: appContextIn }) => error => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor.logError({
        name: 'neotracker_wallet_open_keystore_upload_file_error',
        error,
      });
    },
    extractWallet: () => (readerResult: string | Buffer) => {
      if (walletAPI.isNEP2(readerResult)) {
        return { type: 'nep2', wallet: readerResult };
      }

      return {
        type: 'deprecated',
        wallet: walletAPI.extractKeystore({ text: readerResult }),
      };
    },
    unlockWallet: ({ appContext }) => (result, password) => {
      if (result.type === 'deprecated') {
        return walletAPI
          .getPrivateKey({ keystore: result.wallet, password })
          .then(privateKey =>
            walletAPI.addAccount({
              appContext,
              privateKey,
              password,
            }),
          );
      }

      return walletAPI.addNEP2Account({
        appContext,
        nep2: result.wallet,
        password,
      });
    },
    onOpen: ({ appContext: appContextIn }) => () => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor.log({
        name: 'neotracker_wallet_open_keystore',
        level: 'verbose',
        error: {},
      });
    },
    onOpenError: ({ appContext: appContextIn }) => error => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor.log({
        name: 'neotracker_wallet_open_keystore',
        level: 'verbose',
        error: { error },
      });
    },
  }): $FlowFixMe),
  pure,
);

export default (enhance(OpenWalletKeystore): React.ComponentType<
  ExternalProps,
>);

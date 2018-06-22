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

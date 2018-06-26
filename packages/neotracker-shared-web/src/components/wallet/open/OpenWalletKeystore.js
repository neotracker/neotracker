/* @flow */
import { type HOC, compose, getContext, pure, withHandlers } from 'recompose';
import * as React from 'react';

import _ from 'lodash';

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
  classes: Object,
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

const extractJSONStandardWallet = (fileContents: string) => {
  const jsonKeystore = JSON.parse(fileContents);
  if (jsonKeystore.accounts == null) {
    throw new Error('Invalid Keystore File.');
  }
  if (jsonKeystore.accounts.length === 1) {
    return {
      origin: 'json-standard',
      type: 'nep2',
      wallet: jsonKeystore.accounts[0].key,
    };
  }
  return {
    origin: 'json-standard',
    type: 'nep2Array',
    wallet: jsonKeystore.accounts.map((account) => ({
      address: account.address,
      nep2: account.key,
    })),
  };
};

const extractNEXWallet = (fileContents: string) => {
  const nexKeystore = fileContents.split('\n');
  const nexAddressArray = nexKeystore
    .filter((element) => element.includes('Address'))
    .map((addressLine) => addressLine.split(': ')[1]);
  const nexKeyArray = nexKeystore
    .filter((element) => element.includes('Encrypted Key'))
    .map((keyLine) => keyLine.split(': ')[1]);
  const nexWalletArray = _.zip(nexAddressArray, nexKeyArray).map((account) => ({
    address: account[0],
    nep2: account[1],
  }));
  if (nexWalletArray.length === 0) {
    throw new Error('Invalid Keystore File.');
  }
  if (nexWalletArray.length === 1) {
    return {
      origin: 'nex',
      type: 'nep2',
      wallet: nexWalletArray[0].nep2,
    };
  }
  return { origin: 'nex', type: 'nep2Array', wallet: nexWalletArray };
};

const enhance: HOC<*, *> = compose(
  getContext({ appContext: () => null }),
  (withHandlers({
    read: () => (reader, file) => reader.readAsText(file),
    onUploadFileError: ({ appContext: appContextIn }) => (error) => {
      const appContext = ((appContextIn: $FlowFixMe): AppContext);
      appContext.monitor.logError({
        name: 'neotracker_wallet_open_keystore_upload_file_error',
        error,
      });
    },
    extractWallet: () => (readerResultIn: string | Buffer) => {
      const readerResult =
        readerResultIn instanceof Buffer
          ? readerResultIn.toString('utf8')
          : readerResultIn;

      if (walletAPI.isNEP2(readerResult)) {
        return { origin: 'neotracker', type: 'nep2', wallet: readerResult };
      }
      try {
        return extractJSONStandardWallet(readerResult);
      } catch (error) {
        // do nothing
      }
      try {
        return extractNEXWallet(readerResult);
      } catch (error) {
        // do nothing
      }
      return {
        origin: 'neotracker',
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
    onOpenError: ({ appContext: appContextIn }) => (error) => {
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

/* @flow */
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import * as React from 'react';

import { createPrivateKey, privateKeyToAddress } from '@neo-one/client-common';
import { withRouter } from 'react-router-dom';

import { CreateKeystoreView } from '../keystore';

import { api as walletAPI } from '../../../wallet';

import NewWalletSaveKeystore from './NewWalletSaveKeystore';
import NewWalletSavePrivateKey from './NewWalletSavePrivateKey';

type SavePasswordStage = {|
  type: 'password',
  privateKey: string,
|};
type SaveKeystoreStage = {|
  type: 'save-keystore',
  password: string,
  filename: string,
  privateKey: string,
  nep2: string,
  address: string,
|};
type SavePrivateKeyStage = {|
  type: 'save-private-key',
  password: string,
  privateKey: string,
  nep2: string,
  address: string,
|};

type Stage = SavePasswordStage | SaveKeystoreStage | SavePrivateKeyStage;

type ExternalProps = {|
  privateKey?: string,
  allowPrivateKeyContinue?: boolean,
  onCreateKeystore: (password: string) => void,
  onContinueKeystore: () => void,
  onContinuePrivateKey: (stage: SavePrivateKeyStage) => void,
  className?: string,
|};
type InternalProps = {|
  stage: Stage,
  onCreateKeystore: (password: string, nep2: string) => void,
  onContinueKeystore: () => void,
  onContinuePrivateKey: () => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function NewWalletFlow({
  className,
  allowPrivateKeyContinue,
  onCreateKeystore,
  onContinueKeystore,
  onContinuePrivateKey,
  stage,
}: Props): React.Element<any> | null {
  switch (stage.type) {
    case 'password':
      return (
        <CreateKeystoreView
          className={className}
          privateKey={stage.privateKey}
          onCreate={onCreateKeystore}
        />
      );
    case 'save-keystore':
      return (
        <NewWalletSaveKeystore
          nep2={stage.nep2}
          filename={stage.filename}
          onContinue={onContinueKeystore}
        />
      );
    case 'save-private-key':
      return (
        <NewWalletSavePrivateKey
          privateKey={stage.privateKey}
          address={stage.address}
          allowContinue={!!allowPrivateKeyContinue}
          onContinue={onContinuePrivateKey}
        />
      );
    default:
      // eslint-disable-next-line
      (stage: empty);
      return null;
  }
}

const enhance: HOC<*, *> = compose(
  withStateHandlers(
    ({ privateKey }) => ({
      stage: {
        type: 'password',
        privateKey: privateKey == null ? createPrivateKey() : privateKey,
      },
    }),
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  withRouter,
  withHandlers({
    onCreateKeystore: ({
      setState,
      onCreateKeystore,
      stage: { privateKey },
    }) => (password: string, nep2: string) => {
      const address = privateKeyToAddress(privateKey);
      onCreateKeystore(password);
      setState((prevState) => ({
        ...prevState,
        stage: ({
          type: 'save-keystore',
          filename: walletAPI.createKeystoreFilename({
            address,
          }),
          password,
          privateKey,
          nep2,
          address,
        }: SaveKeystoreStage),
      }));
    },
    onContinueKeystore: ({ setState, onContinueKeystore }) => () => {
      setState((prevState) => ({
        ...prevState,
        stage: ({
          type: 'save-private-key',
          privateKey: prevState.stage.privateKey,
          nep2: prevState.stage.nep2,
          address: prevState.stage.address,
          password: prevState.stage.password,
        }: SavePrivateKeyStage),
      }));
      onContinueKeystore();
    },
    onContinuePrivateKey: ({ stage, onContinuePrivateKey }) => () =>
      onContinuePrivateKey(stage),
  }),
  pure,
);

export default (enhance(NewWalletFlow): React.ComponentType<ExternalProps>);

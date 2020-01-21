/* @flow */
import { type HOC, compose, pure, withStateHandlers } from 'recompose';
import * as React from 'react';

import { SaveKeystoreFile } from '../keystore';

import NewWalletSaveCommon from './NewWalletSaveCommon';

type ExternalProps = {|
  nep2: string,
  filename: string,
  onContinue: () => void,
  className?: string,
|};
type InternalProps = {|
  keystoreSaved: boolean,
  onSave: () => void,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function NewWalletSaveKeystore({
  nep2,
  filename,
  onContinue,
  className,
  keystoreSaved,
  onSave,
}: Props): React.Element<*> {
  return (
    <NewWalletSaveCommon
      className={className}
      title="Save Your Keystore File"
      saveElement={
        <SaveKeystoreFile nep2={nep2} filename={filename} onSave={onSave} />
      }
      saved={keystoreSaved}
      onContinue={onContinue}
    />
  );
}

const enhance: HOC<*, *> = compose(
  pure,
  (withStateHandlers(() => ({ keystoreSaved: false }), {
    onSave: (prevState) => () => ({
      ...prevState,
      keystoreSaved: true,
    }),
  }): $FlowFixMe),
);

export default (enhance(
  NewWalletSaveKeystore,
): React.ComponentType<ExternalProps>);

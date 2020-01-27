/* @flow */
import { type HOC, compose, pure, withPropsOnChange } from 'recompose';
import * as React from 'react';
import type { LocalWallet } from '@neo-one/client-core';

import { api as walletAPI } from '../../../wallet';

import GenerateKeystore from './GenerateKeystore';
import SaveKeystoreFile from './SaveKeystoreFile';

type ExternalProps = {|
  wallet: LocalWallet,
  className?: string,
|};
type InternalProps = {|
  filename: string,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SaveOrGenerateKeystore({
  wallet,
  className,
  filename,
}: Props): React.Element<any> {
  if (wallet.nep2 == null) {
    return <GenerateKeystore className={className} />;
  }

  return (
    <SaveKeystoreFile
      className={className}
      nep2={wallet.nep2}
      filename={filename}
    />
  );
}

const enhance: HOC<*, *> = compose(
  (withPropsOnChange(['wallet'], ({ wallet }: {| wallet: LocalWallet |}) => ({
    filename: walletAPI.createKeystoreFilename({
      address: wallet.userAccount.id.address,
    }),
  })): $FlowFixMe),
  pure,
);

export default (enhance(
  SaveOrGenerateKeystore,
): React.ComponentType<ExternalProps>);

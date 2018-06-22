/* @flow */
import { api as walletAPI, type KeystoreDeprecated } from '../../../wallet';
import type { AppContext } from '../../../AppContext';

export default async ({
  appContext,
  wallet,
  password,
}: {|
  appContext: AppContext,
  wallet:
    | {| type: 'nep2', wallet: string |}
    | {| type: 'deprecated', wallet: KeystoreDeprecated |},
  password: string,
|}) => {
  if (wallet.type === 'deprecated') {
    return walletAPI
      .getPrivateKey({ keystore: wallet.wallet, password })
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
    nep2: wallet.wallet,
    password,
  });
};

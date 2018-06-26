/* @flow */
import { api as walletAPI, type KeystoreDeprecated } from '../../../wallet';
import type { AppContext } from '../../../AppContext';

export default async ({
  appContext,
  wallet,
}: {|
  appContext: AppContext,
  wallet:
    | {| type: 'nep2', wallet: string, password: string |}
    | {| type: 'deprecated', wallet: KeystoreDeprecated, password: string |}
    | {|
        type: 'nep2Array',
        wallet: Array<{| address: string, nep2: string |}>,
      |},
|}) => {
  if (wallet.type === 'deprecated') {
    return walletAPI
      .getPrivateKey({ keystore: wallet.wallet, password: wallet.password })
      .then((privateKey) =>
        walletAPI.addAccount({
          appContext,
          privateKey,
          password: wallet.password,
        }),
      );
  }

  if (wallet.type === 'nep2Array') {
    return Promise.all(
      wallet.wallet.map((account) =>
        walletAPI.addNEP2Account({
          appContext,
          nep2: account.nep2,
          address: account.address,
        }),
      ),
    );
  }

  return walletAPI.addNEP2Account({
    appContext,
    nep2: (wallet: $FlowFixMe).wallet,
    password: wallet.password,
  });
};

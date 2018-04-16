/* @flow */
export type KeystoreDeprecated = {|
  version: 3,
  id: string,
  address: string,
  crypto: {
    ciphertext: string,
    cipherparams: {
      iv: string,
    },
    cipher: string,
    kdf: string,
    kdfparams: Object,
    mac: string,
  },
|};

export type LockedWalletDeprecated = {|
  isLocked: true,
  address: string,
  name: string,
  keystore: KeystoreDeprecated,
|};

export type ClaimAllGASProgress =
  | {| type: 'fetch-unspent-sending' |}
  | {| type: 'fetch-unspent-done' |}
  | {| type: 'spend-all-sending' |}
  | {| type: 'spend-all-confirming', hash: string |}
  | {| type: 'spend-all-confirmed' |}
  | {| type: 'spend-all-skip' |}
  | {| type: 'fetch-unclaimed-sending' |}
  | {| type: 'fetch-unclaimed-done' |}
  | {| type: 'claim-gas-sending' |}
  | {| type: 'claim-gas-confirming', hash: string |}
  | {| type: 'claim-gas-confirmed' |}
  | {| type: 'claim-gas-skip' |};

export type AssetType = 'NEP5' | string;

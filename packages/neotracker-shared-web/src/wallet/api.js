/* @flow */
import {
  NEO_ASSET_HASH_0X,
  ClientError,
  labels,
  numbers,
} from 'neotracker-shared-utils';
import BigNumber from 'bignumber.js';
import {
  type PrivateKeyString,
  type UnlockedLocalWallet,
  type UserAccountID,
  abi,
  addressToScriptHash,
  privateKeyToAddress,
  isNEP2 as clientIsNEP2,
} from '@neo-one/client';

import { combineLatest } from 'rxjs/observable/combineLatest';
import { compose, getContext, mapPropsStream } from 'recompose';
import crypto from 'crypto';
import { map, switchMap, take } from 'rxjs/operators';
import { of as _of } from 'rxjs/observable/of';
import scrypt from 'scrypt-js';
import { sha3_256 } from 'js-sha3';

import type { AppContext } from '../AppContext';
import type {
  AssetType,
  KeystoreDeprecated,
  LockedWalletDeprecated,
} from './types';
import { CodedClientError } from '../errors';

export const MAX_NAME_CHARACTERS = 34;
export const validateName = (name: string) => {
  if (name.length === 0) {
    throw new CodedClientError(CodedClientError.NAME_TOO_SHORT_ERROR);
  }

  if (name.length > MAX_NAME_CHARACTERS) {
    throw new CodedClientError(CodedClientError.NAME_TOO_LONG_ERROR);
  }
};

const add0x = (value: string) =>
  value.startsWith('0x') ? value : `0x${value}`;
const strip0x = (value: string) =>
  value.startsWith('0x') ? value.slice(2) : value;

const doConvertAccount = async ({
  appContext: { client },
  wallet,
  password,
}: {|
  appContext: AppContext,
  wallet: UnlockedLocalWallet,
  password: string,
|}): Promise<void> => {
  const { localStorage, memory } = client.providers;
  const { account, privateKey } = wallet;

  await memory.keystore.deleteAccount(account.id);
  try {
    await localStorage.keystore.addAccount({
      network: account.id.network,
      name: account.name,
      privateKey,
      password,
    });
    await client.selectAccount(account.id);
  } catch (error) {
    try {
      await memory.keystore.addAccount({
        network: account.id.network,
        name: account.name,
        privateKey,
      });
      await client.selectAccount(account.id);
    } catch (err) {
      // ignore errors
    }
    throw error;
  }
};

export const convertAccount = async (input: {|
  appContext: AppContext,
  wallet: UnlockedLocalWallet,
  password: string,
|}): Promise<void> => {
  try {
    return doConvertAccount(input);
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }

    throw new CodedClientError(CodedClientError.CREATE_NEP2_ERROR, error);
  }
};

export const createKeystoreFilename = ({
  address,
}: {
  address: string,
}): string => `${address}.txt`;

const prependKey = (seedIn: Buffer) => {
  let seed = seedIn;
  while (seed.length < 32) {
    const nullBuff = Buffer.from([0x00]);
    seed = Buffer.concat([nullBuff, seed]);
  }
  return seed;
};

const decipherBuffer = (decipher, data) =>
  Buffer.concat([decipher.update(data), decipher.final()]);

export const getPrivateKey = async ({
  keystore,
  password,
}: {|
  keystore: KeystoreDeprecated,
  password: string,
|}): Promise<PrivateKeyString> => {
  let derivedKey;
  const { kdfparams } = keystore.crypto;
  if (keystore.crypto.kdf === 'scrypt') {
    try {
      derivedKey = await new Promise((resolve, reject) =>
        scrypt(
          Buffer.from(password),
          Buffer.from(kdfparams.salt, 'hex'),
          kdfparams.n,
          kdfparams.r,
          kdfparams.p,
          kdfparams.dklen,
          (error, progress, key) => {
            if (error != null) {
              reject(error);
            } else if (key) {
              resolve(Buffer.from(key));
            }
          },
        ),
      );
    } catch (error) {
      throw new CodedClientError(
        CodedClientError.DECRYPT_KEYSTORE_DERIVED_KEY_ERROR,
        error,
      );
    }
  } else if (keystore.crypto.kdf === 'pbkdf2') {
    if (kdfparams.prf !== 'hmac-sha256') {
      throw new CodedClientError(
        CodedClientError.DECRYPT_KEYSTORE_UNSUPPORTED_PBKDF2_PARAMETERS,
      );
    }
    try {
      derivedKey = await new Promise((resolve, reject) =>
        crypto.pbkdf2(
          Buffer.from(password),
          Buffer.from(kdfparams.salt, 'hex'),
          kdfparams.c,
          kdfparams.dklen,
          'sha256',
          (error, key) => {
            if (error != null) {
              reject(error);
            } else {
              resolve(key);
            }
          },
        ),
      );
    } catch (error) {
      throw new CodedClientError(
        CodedClientError.DECRYPT_KEYSTORE_DERIVED_KEY_ERROR,
        error,
      );
    }
  } else {
    throw new CodedClientError(
      CodedClientError.DECRYPT_KEYSTORE_UNSUPPORTED_ALGO,
    );
  }

  let ciphertext;
  let mac;
  try {
    ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex');
    mac = sha3_256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]));
  } catch (error) {
    throw new CodedClientError(
      CodedClientError.DECRYPT_KEYSTORE_UNKNOWN_CRYPTO_ERROR,
      error,
    );
  }
  if (mac.toString('hex') !== keystore.crypto.mac) {
    throw new CodedClientError(
      CodedClientError.DECRYPT_KEYSTORE_WRONG_PASSPHRASE,
    );
  }

  let seed;
  try {
    const decipher = crypto.createDecipheriv(
      keystore.crypto.cipher,
      derivedKey.slice(0, 16),
      Buffer.from(keystore.crypto.cipherparams.iv, 'hex'),
    );
    seed = prependKey(decipherBuffer(decipher, ciphertext));
  } catch (error) {
    throw new CodedClientError(
      CodedClientError.DECRYPT_KEYSTORE_DECIPHER_ERROR,
      error,
    );
  }

  const privateKey = seed.toString('hex');

  const address = privateKeyToAddress(privateKey);
  if (address !== keystore.address) {
    throw new CodedClientError(CodedClientError.DECRYPT_KEYSTORE_WRONG_ADDRESS);
  }

  return privateKey;
};

export const unlockWalletDeprecated = async ({
  appContext,
  wallet,
  password,
  deleteWallet,
}: {|
  appContext: AppContext,
  wallet: LockedWalletDeprecated,
  password: string,
  deleteWallet: () => void,
|}): Promise<void> => {
  const privateKey = await getPrivateKey({
    keystore: wallet.keystore,
    password,
  });
  const { client, network } = appContext;
  await client.providers.localStorage.keystore.addAccount({
    network,
    name: wallet.name,
    privateKey,
    password,
  });
  deleteWallet();
};

const isValidKDFParams = (kdf: string, kdfparams: Object) =>
  typeof kdfparams.dklen === 'number' &&
  typeof kdfparams.salt === 'string' &&
  ((kdf === 'scrypt' &&
    typeof kdfparams.n === 'number' &&
    typeof kdfparams.r === 'number' &&
    typeof kdfparams.p === 'number') ||
    (kdf === 'pbkdf2' &&
      typeof kdfparams.c === 'number' &&
      typeof kdfparams.prf === 'string'));

export const extractKeystore = ({
  text,
}: {
  text: mixed,
}): KeystoreDeprecated => {
  if (typeof text !== 'string') {
    throw new CodedClientError(CodedClientError.EXTRACT_KEYSTORE_INVALID_FILE);
  }

  let keystore;
  try {
    keystore = JSON.parse(text);
  } catch (error) {
    throw new CodedClientError(
      CodedClientError.EXTRACT_KEYSTORE_INVALID_JSON,
      error,
    );
  }
  if (
    !(
      typeof keystore === 'object' &&
      typeof keystore.version === 'number' &&
      keystore.version === 3 &&
      typeof keystore.id === 'string' &&
      typeof keystore.address === 'string' &&
      keystore.address.length === 34 &&
      typeof keystore.crypto === 'object' &&
      typeof keystore.crypto.ciphertext === 'string' &&
      typeof keystore.crypto.cipherparams === 'object' &&
      typeof keystore.crypto.cipherparams.iv === 'string' &&
      typeof keystore.crypto.cipher === 'string' &&
      typeof keystore.crypto.kdf === 'string' &&
      typeof keystore.crypto.kdfparams === 'object' &&
      isValidKDFParams(keystore.crypto.kdf, keystore.crypto.kdfparams) &&
      typeof keystore.crypto.mac === 'string'
    )
  ) {
    throw new CodedClientError(
      CodedClientError.EXTRACT_KEYSTORE_INVALID_FORMAT,
    );
  }

  return keystore;
};

export const validateAmount = (
  amount: string,
  coin: {
    value: string,
    asset: {
      precision: number,
    },
  },
): ?string => {
  let amountNumber;
  try {
    amountNumber = new BigNumber(amount);
  } catch (error) {
    // ignore errors
  }

  if (
    amountNumber == null ||
    amountNumber.toFixed(amountNumber.decimalPlaces()) !== amount
  ) {
    return 'Please enter a number.';
  }

  if (amountNumber.decimalPlaces() > coin.asset.precision) {
    return 'Too many decimal places.';
  }

  const coinValueNumber = new BigNumber(coin.value);
  if (amountNumber.gt(coinValueNumber)) {
    return 'Amount entered is more than you own.';
  }

  if (amountNumber.isNegative() || amountNumber.isZero()) {
    return 'Amount must be positive';
  }

  return null;
};

export const doSendAsset = async ({
  appContext,
  account,
  toAddress,
  amount,
  assetType,
  assetHash: assetHashIn,
}: {|
  appContext: AppContext,
  account: UserAccountID,
  toAddress: string,
  amount: BigNumber,
  assetType: AssetType,
  assetHash: string,
|}) => {
  const asset = add0x(assetHashIn);
  const { client, readClient, network } = appContext;
  const transactionOptions = { from: account };

  if (assetType === 'NEP5') {
    const contractABI = await abi.NEP5(readClient, asset);
    const contract = client.smartContract({
      networks: { [network]: { hash: asset } },
      abi: contractABI,
    });

    const result = await contract.transfer(
      addressToScriptHash(account.address),
      addressToScriptHash(toAddress),
      amount,
      transactionOptions,
    );

    return strip0x(result.transaction.txid);
  }

  const result = await client.transfer(
    amount,
    asset,
    toAddress,
    transactionOptions,
  );

  return result.transaction.txid;
};

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

export const claimAllGAS = ({
  appContext,
  account: accountID,
  onProgress,
}: {
  appContext: AppContext,
  account: UserAccountID,
  onProgress?: (progress: ClaimAllGASProgress) => void,
}) =>
  appContext.monitor
    .withData({
      [labels.NEO_ADDRESS]: accountID.address,
    })
    .captureSpanLog(
      async span => {
        const callOnProgress = (progress: ClaimAllGASProgress) => {
          if (onProgress) {
            onProgress(progress);
          }
        };

        const { client, readClient } = appContext;
        const transactionOptions = { from: accountID, monitor: span };

        callOnProgress({ type: 'fetch-unspent-sending' });
        const [account, appOptions] = await Promise.all([
          readClient.getAccount(accountID.address, span),
          appContext.options$.pipe(take(1)).toPromise(),
        ]);
        const neoBalance = account.balances[NEO_ASSET_HASH_0X] || numbers.ZERO;
        callOnProgress({ type: 'fetch-unspent-done' });

        if (neoBalance.gt(numbers.ZERO)) {
          callOnProgress({ type: 'spend-all-sending' });
          const result = await client.transfer(
            neoBalance,
            NEO_ASSET_HASH_0X,
            account.address,
            transactionOptions,
          );
          callOnProgress({
            type: 'spend-all-confirming',
            hash: strip0x(result.transaction.txid),
          });
          await result.confirmed({
            timeoutMS: appOptions.confirmLimitMS,
            monitor: span,
          });
          callOnProgress({ type: 'spend-all-confirmed' });
        } else {
          callOnProgress({ type: 'spend-all-skip' });
        }

        try {
          callOnProgress({ type: 'claim-gas-sending' });
          const result = await client.claim(transactionOptions);
          callOnProgress({
            type: 'claim-gas-confirming',
            hash: strip0x(result.transaction.txid),
          });
          await result.confirmed({
            timeoutMS: appOptions.confirmLimitMS,
            monitor: span,
          });
          callOnProgress({ type: 'claim-gas-confirmed' });
        } catch (error) {
          if (error.code === 'NOTHING_TO_CLAIM') {
            callOnProgress({ type: 'claim-gas-skip' });
          } else {
            throw error;
          }
        }
      },
      { name: 'neotracker_wallet_claim_all_gas' },
    );

export const mapCurrentLocalWallet = compose(
  getContext({ appContext: () => null }),
  mapPropsStream(props$ =>
    props$.pipe(
      switchMap(props => {
        const { client } = (props.appContext: AppContext);
        return client.currentAccount$.pipe(
          switchMap(account => {
            let wallet$ = _of(null);
            if (account != null) {
              if (account.type === 'memory') {
                wallet$ = client.providers.memory.keystore.getWallet$(
                  account.id,
                );
              }

              if (account.type === 'localStorage') {
                wallet$ = client.providers.localStorage.keystore.getWallet$(
                  account.id,
                );
              }
            }

            return combineLatest(_of(account), wallet$);
          }),
          map(([account, wallet]) => ({
            ...props,
            account,
            wallet,
          })),
        );
      }),
    ),
  ),
);

export const mapAccounts = compose(
  getContext({ appContext: () => null }),
  mapPropsStream(props$ =>
    props$.pipe(
      switchMap(props => {
        const { client } = (props.appContext: AppContext);
        return client.accounts$.pipe(
          map(accounts => ({
            ...props,
            accounts,
          })),
        );
      }),
    ),
  ),
);

export const selectAccount = async ({
  appContext,
  id,
}: {|
  appContext: AppContext,
  id?: UserAccountID,
|}): Promise<void> => {
  const { client } = appContext;
  await client.selectAccount(id);
};

export const unlockWallet = async ({
  appContext: { client },
  id,
  password,
}: {|
  appContext: AppContext,
  id: UserAccountID,
  password: string,
|}): Promise<void> => {
  await client.providers.localStorage.keystore.unlockWallet({ id, password });
};

export const updateName = async ({
  appContext: { client },
  id,
  name,
}: {|
  appContext: AppContext,
  id: UserAccountID,
  name: string,
|}): Promise<void> => {
  await client.updateAccountName({ id, name });
};

export const deleteAccount = async ({
  appContext: { client },
  id,
}: {|
  appContext: AppContext,
  id: UserAccountID,
|}): Promise<void> => {
  await client.deleteAccount(id);
  const accounts = client.getAccounts();
  const [account] = accounts;
  await client.selectAccount(account == null ? undefined : account.id);
};

export const addAccount = async ({
  appContext: { network, client },
  privateKey,
  password,
  nep2,
}: {|
  appContext: AppContext,
  privateKey: string,
  password: string,
  nep2?: string,
|}): Promise<void> => {
  const wallet = await client.providers.localStorage.keystore.addAccount({
    network,
    privateKey,
    password,
    nep2,
  });
  await client.selectAccount(wallet.account.id);
};

export const addNEP2Account = async ({
  appContext: { network, client },
  nep2,
  password,
}: {|
  appContext: AppContext,
  nep2: string,
  password: string,
|}): Promise<void> => {
  const wallet = await client.providers.localStorage.keystore.addAccount({
    network,
    nep2,
    password,
  });
  await client.selectAccount(wallet.account.id);
};

export const addPrivateKeyAccount = async ({
  appContext: { network, client },
  privateKey,
}: {|
  appContext: AppContext,
  privateKey: string,
|}): Promise<void> => {
  const wallet = await client.providers.memory.keystore.addAccount({
    network,
    privateKey,
  });
  await client.selectAccount(wallet.account.id);
};

export const isNEP2 = (value: string | Buffer) =>
  typeof value === 'string' && clientIsNEP2(value);

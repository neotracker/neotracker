/* @flow */
// TODO: This really belongs in neotracker-shared-web, but to make the graphql
//       code totally independent it has to live here.
export type AppOptions = {|
  meta: {|
    title: string,
    name: string,
    description: string,
    walletDescription: string,
    social: {|
      twitter: string,
      fb: string,
    |},
    donateAddress: string,
  |},
  url: string,
  rpcURL: string,
  maintenance: boolean,
  disableWalletModify: boolean,
  confirmLimitMS: number,
|};

export type NetworkType = 'main' | 'test' | 'priv';

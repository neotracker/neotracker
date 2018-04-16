/* @flow */
import type { NetworkType } from 'neotracker-shared-utils';

export const mainRPCURL = 'https://neotracker.io/rpc';
export const testRPCURL = 'https://testnet.neotracker.io/rpc';

export const getPrivRPCURL = () => {
  let rpcURL = process.env.NEOTRACKER_RPC_URL;
  if (rpcURL == null) {
    rpcURL = 'http://localhost:40200/rpc';
  }
  return rpcURL;
};

export const getNetwork = () =>
  process.env.NEOTRACKER_NETWORK == null
    ? 'priv'
    : process.env.NEOTRACKER_NETWORK;

export function getNetworkOptions<T>({
  main,
  test,
  priv,
}: {|
  main: T,
  test: T,
  priv: T,
|}): {| options: T, network: NetworkType |} {
  const network = getNetwork();
  switch (network) {
    case 'main':
      return { options: main, network };
    case 'test':
      return { options: test, network };
    case 'priv':
      return { options: priv, network };
    default:
      throw new Error('Unknown network type');
  }
}

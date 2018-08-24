import { NetworkType } from '@neotracker/shared-utils';

export const mainRPCURL = 'https://neotracker.io/rpc';
export const testRPCURL = 'https://testnet.neotracker.io/rpc';
export const privRPCURL = 'http://localhost:40200/rpc';

export function getNetworkOptions<T>({
  network = 'priv',
  main,
  test,
  priv,
}: {
  readonly network?: string;
  readonly main: T;
  readonly test: T;
  readonly priv: T;
}): { readonly options: T; readonly network: NetworkType } {
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

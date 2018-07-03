import { common } from './common';
import { testRPCURL } from './utils';

export const test = ({ port }: { readonly port: number }) =>
  common({
    database: 'neotracker_test',
    rpcURL: testRPCURL,
    port,
    blacklistNEP5Hashes: [],
  });

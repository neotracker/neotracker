import { testDatabase, testRPCURL } from 'neotracker-build-utils';
import { common } from './common';

export const test = ({ port }: { readonly port: number }) =>
  common({
    database: testDatabase,
    rpcURL: testRPCURL,
    port,
  });

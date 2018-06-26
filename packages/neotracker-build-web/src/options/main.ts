import { mainDatabase, mainRPCURL } from 'neotracker-build-utils';
import { common } from './common';

export const main = ({ port }: { readonly port: number }) =>
  common({
    database: mainDatabase,
    rpcURL: mainRPCURL,
    port,
  });

import { common } from './common';

export const priv = ({ port, rpcURL }: { readonly port: number; readonly rpcURL: string }) =>
  common({
    database: 'neotracker_priv',
    rpcURL,
    port,
    blacklistNEP5Hashes: [],
  });

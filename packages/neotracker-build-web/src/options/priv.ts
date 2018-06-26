import { privDatabase } from 'neotracker-build-utils';
import { common } from './common';

export const priv = ({ port, rpcURL }: { readonly port: number; readonly rpcURL: string }) =>
  common({
    database: privDatabase,
    rpcURL,
    port,
  });

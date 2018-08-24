import { AssetsConfiguration, common } from './common';
import { privRPCURL } from './utils';

export const priv = ({
  port,
  dbFileName,
  configuration,
  rpcURL = privRPCURL,
}: {
  readonly port: number;
  readonly dbFileName: string;
  readonly rpcURL?: string;
  readonly configuration: AssetsConfiguration;
}) =>
  common({
    database: 'neotracker_priv',
    rpcURL,
    port,
    blacklistNEP5Hashes: [],
    dbFileName,
    configuration,
  });

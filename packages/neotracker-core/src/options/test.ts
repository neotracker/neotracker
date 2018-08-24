import { AssetsConfiguration, common } from './common';
import { testRPCURL } from './utils';

export const test = ({
  port,
  dbFileName,
  configuration,
  rpcURL = testRPCURL,
}: {
  readonly port: number;
  readonly dbFileName: string;
  readonly rpcURL?: string;
  readonly configuration: AssetsConfiguration;
}) =>
  common({
    database: 'neotracker_test',
    rpcURL,
    port,
    blacklistNEP5Hashes: [],
    dbFileName,
    configuration,
  });

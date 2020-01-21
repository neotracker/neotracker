import { DBClient } from '@neotracker/server-db';
import { AssetsConfiguration, common } from './common';
import { testRPCURL } from './utils';

export const test = ({
  port,
  dbFileName,
  dbUser,
  dbPassword,
  dbClient,
  dbConnectionString,
  configuration,
  rpcURL = testRPCURL,
}: {
  readonly port: number;
  readonly dbFileName: string;
  readonly dbUser?: string;
  readonly dbPassword?: string;
  readonly dbClient?: DBClient;
  readonly dbConnectionString?: string;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
}) =>
  common({
    database: 'neotracker_test',
    rpcURL,
    port,
    blacklistNEP5Hashes: [],
    dbFileName,
    dbUser,
    dbPassword,
    dbClient,
    dbConnectionString,
    configuration,
  });

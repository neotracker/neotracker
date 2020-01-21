import { DBClient } from '@neotracker/server-db';
import { AssetsConfiguration, common } from './common';
import { privRPCURL } from './utils';

export const priv = ({
  port,
  dbFileName,
  dbUser,
  dbPassword,
  dbClient,
  dbConnectionString,
  database = 'neotracker_priv',
  configuration,
  rpcURL = privRPCURL,
}: {
  readonly port: number;
  readonly dbFileName: string;
  readonly dbUser?: string;
  readonly dbPassword?: string;
  readonly dbClient?: DBClient;
  readonly dbConnectionString?: string;
  readonly database?: string;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
}) =>
  common({
    database,
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

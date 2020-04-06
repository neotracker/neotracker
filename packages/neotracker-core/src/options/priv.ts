import { isPGDBConfig, LiteDBConfig, PGDBConfig, PGDBConfigString } from '../getConfiguration';
import { AssetsConfiguration, common } from './common';
import { privRPCURL } from './utils';

export const priv = ({
  port,
  db: dbIn,
  configuration,
  rpcURL = privRPCURL,
  googleAnalyticsTag,
  prod,
}: {
  readonly port: number;
  readonly db: LiteDBConfig | PGDBConfig | PGDBConfigString;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
  readonly googleAnalyticsTag: string;
  readonly prod: boolean;
}) => {
  const db = isPGDBConfig(dbIn)
    ? {
        client: dbIn.client,
        connection: {
          ...dbIn.connection,
          database: dbIn.connection.database === undefined ? 'neotracker_priv' : dbIn.connection.database,
        },
      }
    : dbIn;

  return common({
    prod,
    db,
    rpcURL,
    googleAnalyticsTag,
    port,
    blacklistNEP5Hashes: [],
    configuration,
  });
};

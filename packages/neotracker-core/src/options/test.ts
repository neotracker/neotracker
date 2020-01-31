import { isPGDBConfig, LiteDBConfig, PGDBConfig, PGDBConfigString } from '../getConfiguration';
import { AssetsConfiguration, common } from './common';
import { testRPCURL } from './utils';

export const test = ({
  port,
  db: dbIn,
  configuration,
  rpcURL = testRPCURL,
}: {
  readonly port: number;
  readonly db: LiteDBConfig | PGDBConfig | PGDBConfigString;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
}) => {
  const db = isPGDBConfig(dbIn)
    ? {
        client: dbIn.client,
        connection: {
          ...dbIn.connection,
          database: dbIn.connection.database === undefined ? 'neotracker_test' : dbIn.connection.database,
        },
      }
    : dbIn;

  return common({
    rpcURL,
    port,
    blacklistNEP5Hashes: [],
    db,
    configuration,
  });
};

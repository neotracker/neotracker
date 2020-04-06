import { isPGDBConfig, LiteDBConfig, PGDBConfig, PGDBConfigString } from '../getConfiguration';
import { AssetsConfiguration, common } from './common';
import { mainRPCURL } from './utils';

export const main = ({
  port,
  db: dbIn,
  configuration,
  rpcURL = mainRPCURL,
  googleAnalyticsTag,
  url = 'https://neotracker.io',
  domain = 'neotracker.io',
  prod,
}: {
  readonly port: number;
  readonly db: LiteDBConfig | PGDBConfig | PGDBConfigString;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
  readonly googleAnalyticsTag: string;
  readonly url?: string;
  readonly domain?: string;
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
    rpcURL,
    googleAnalyticsTag,
    url,
    domain,
    port,
    blacklistNEP5Hashes: [
      '4b4f63919b9ecfd2483f0c72ff46ed31b5bbb7a4', //  Phantasma
      'a0b328c01eac8b12b0f8a4fe93645d18fb3f1f0a', //  NKN Token
      '7ac4a2bb052a047506f2f2d3d1528b89cc38e8d4', //  Quarteria
      '78e6d16b914fe15bc16150aeb11d0c2a8e532bdd', //  Switcheo Token
      '23501e5fef0f67ec476406c556e91992323a0357', //  Orbis
      '442e7964f6486005235e87e082f56cd52aa663b8', //  Ontology
      '34579e4614ac1a7bd295372d3de8621770c76cdc', //  Concierge
      '2e25d2127e0240c6deaf35394702feb236d4d7fc', //  Narrative Token
      '6d36b38af912ca107f55a5daedc650054f7e4f75',
    ],
    db,
    configuration,
  });
};

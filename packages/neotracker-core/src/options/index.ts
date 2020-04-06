import { NetworkType } from '@neotracker/shared-utils';
import { isPGDBConfig, LiteDBConfig, PGDBConfig, PGDBConfigString } from '../getConfiguration';
import { AssetsConfiguration, common } from './common';

// tslint:disable-next-line: export-name
export { AssetsConfiguration };

export const mainRPCURL = 'https://neotracker.io/rpc';
export const testRPCURL = 'https://testnet.neotracker.io/rpc';
export const privRPCURL = 'http://localhost:9040/rpc';

interface CreateOptions {
  readonly port: number;
  readonly db: LiteDBConfig | PGDBConfig | PGDBConfigString;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
  readonly googleAnalyticsTag: string;
  readonly prod: boolean;
}

export const getOptions = (
  network: NetworkType = 'priv',
  { rpcURL, db: dbIn, configuration, port, googleAnalyticsTag, prod }: CreateOptions,
) => {
  const db = isPGDBConfig(dbIn)
    ? {
        client: dbIn.client,
        connection: {
          ...dbIn.connection,
          database: dbIn.connection.database === undefined ? `neotracker_${network}` : dbIn.connection.database,
        },
      }
    : dbIn;

  switch (network) {
    case 'main':
      return common({
        rpcURL: rpcURL ? rpcURL : mainRPCURL,
        url: 'https://neotracker.io',
        domain: 'neotracker.io',
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
        googleAnalyticsTag,
        prod,
      });

    case 'test':
      return common({
        rpcURL: rpcURL ? rpcURL : testRPCURL,
        url: 'https://testnet.neotracker.io',
        domain: 'testnet.neotracker.io',
        port,
        blacklistNEP5Hashes: [],
        db,
        configuration,
        googleAnalyticsTag,
        prod,
      });

    case 'priv':
      return common({
        rpcURL: rpcURL ? rpcURL : privRPCURL,
        url: 'http://127.0.0.1:1340',
        domain: '127.0.0.1',
        port,
        blacklistNEP5Hashes: [],
        db,
        configuration,
        googleAnalyticsTag,
        prod,
      });
    default:
      throw new Error('Invalid Network Option');
  }
};

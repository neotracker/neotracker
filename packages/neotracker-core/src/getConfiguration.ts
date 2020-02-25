import { LogLevel, setGlobalLogLevel } from '@neotracker/logger';
import * as path from 'path';
import rc from 'rc';
import { BehaviorSubject } from 'rxjs';
import { getOptions } from './options';

export interface LiteDBConfig {
  readonly client: 'sqlite3';
  readonly connection: {
    readonly filename: string;
  };
}

export interface PGDBConfigString {
  readonly client: 'pg';
  readonly connection: string;
}

export interface PGDBConfig {
  readonly client: 'pg';
  readonly connection: {
    readonly host: string;
    readonly port: number;
    readonly user?: string;
    readonly password?: string;
    readonly database?: string;
  };
}

export interface PGDBConfigWithDatabase {
  readonly client: 'pg';
  readonly connection: {
    readonly host: string;
    readonly port: number;
    readonly user?: string;
    readonly password?: string;
    readonly database: string;
  };
}

// tslint:disable-next-line: no-any
export const isPGDBConfig = (value: { [k in string]: any }): value is PGDBConfig =>
  value.client === 'pg' &&
  value.connection !== undefined &&
  typeof value.connection.host === 'string' &&
  typeof value.connection.port === 'number';

// tslint:disable-next-line: no-any
export const isPGDBConfigWithData = (value: { [k in string]: any }): value is PGDBConfigWithDatabase =>
  isPGDBConfig(value) && value.connection.database !== undefined;

// tslint:disable-next-line: no-any
export const isLiteDBConfig = (value: { [k in string]: any }): value is LiteDBConfig =>
  value.client === 'sqlite3' && value.connection !== undefined && typeof value.connection.filename === 'string';

export interface NTConfiguration {
  readonly type: 'all' | 'web' | 'scrape';
  readonly port: number;
  readonly logLevel: LogLevel;
  readonly network: 'priv' | 'main' | string;
  readonly nodeRpcUrl?: string;
  readonly metricsPort?: number;
  readonly db: LiteDBConfig | PGDBConfigString | PGDBConfig;
  readonly resetDB: boolean;
}

export const defaultNTConfiguration: NTConfiguration = {
  type: 'all', // Type of NEOTracker instance to start: 'all', 'web', or 'scrape'
  port: process.env.PORT !== undefined ? Number(process.env.PORT) : 1340, // Port to listen on
  network: 'priv', // Network to run against
  logLevel: 'info',
  nodeRpcUrl: 'http://localhost:9040/rpc', // NEO-ONE Node RPC URL
  db: {
    client: 'sqlite3',
    connection: {
      filename: 'db.sqlite',
    },
  },
  resetDB: false, // Resets database
};

export const getConfiguration = (defaultConfig = defaultNTConfiguration): NTConfiguration => {
  const { port, network, nodeRpcUrl, metricsPort, resetDB, db: dbIn, type, logLevel } = rc('neotracker', defaultConfig);

  setGlobalLogLevel(logLevel);

  const db = isLiteDBConfig(dbIn)
    ? {
        client: dbIn.client,
        connection: {
          filename: path.isAbsolute(dbIn.connection.filename)
            ? dbIn.connection.filename
            : path.resolve(process.cwd(), dbIn.connection.filename),
        },
      }
    : dbIn;

  return {
    port,
    network,
    nodeRpcUrl,
    metricsPort,
    logLevel,
    db,
    type,
    resetDB,
  };
};

export const getCoreConfiguration = () => {
  const {
    port,
    network: neotrackerNetwork,
    nodeRpcUrl: rpcURL,
    metricsPort = 1341,
    db,
    type,
    resetDB,
  } = getConfiguration();
  // tslint:disable-next-line readonly-array
  const getDistPath = (...paths: string[]) => path.resolve(__dirname, '..', 'dist', ...paths);

  const configuration = {
    clientBundlePath: getDistPath('neotracker-client-web'),
    clientBundlePathNext: getDistPath('neotracker-client-web-next'),
    clientPublicPath: '/client/',
    clientPublicPathNext: '/client-next/',
    clientAssetsPath: getDistPath('neotracker-client-web', 'assets.json'),
    clientAssetsPathNext: getDistPath('neotracker-client-web-next', 'assets.json'),
    statsPath: getDistPath('neotracker-client-web-next', 'stats.json'),
    rootAssetsPath: getDistPath('root'),
    publicAssetsPath: getDistPath('public'),
  };

  const { options, network } = getOptions({
    network: neotrackerNetwork,
    rpcURL,
    port,
    db,
    configuration,
  });
  const options$ = new BehaviorSubject(options);

  const environment = {
    server: {
      react: {
        appVersion: 'dev',
      },
      reactApp: {
        appVersion: 'dev',
      },
      directDB: db,
      server: {
        host: '0.0.0.0',
        port,
      },
      network,
      queryMap: {
        queriesPath: getDistPath('queries.json'),
        nextQueriesDir: getDistPath('queries'),
      },
    },
    scrape: {
      network,
    },
    start: {
      metricsPort,
      resetDB,
    },
  };

  return {
    environment,
    options$,
    type,
  };
};

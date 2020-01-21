import * as path from 'path';
import rc from 'rc';
import { BehaviorSubject } from 'rxjs';
import { getOptions } from './options';

export interface NTConfiguration {
  readonly type: 'all' | 'web' | 'scrape';
  readonly port: number;
  readonly network: 'priv' | 'main' | string;
  readonly nodeRpcUrl: string;
  readonly dbClient: 'pg' | 'sqlite3';
  readonly dbFileName: 'db.sqlite';
  readonly dbHost: string | undefined;
  readonly dbPort: number | undefined;
  readonly dbConnectionString: string | undefined;
  readonly dbUser: string | undefined;
  readonly dbPassword: string | undefined;
  readonly database: string;
  readonly resetDB: boolean;
}

export const defaultNTConfiguration: NTConfiguration = {
  type: 'all', // Type of NEOTracker instance to start: 'all', 'web', or 'scrape'
  port: process.env.PORT !== undefined ? Number(process.env.PORT) : 1340, // Port to listen on
  network: 'priv', // Network to run against
  nodeRpcUrl: 'http://localhost:9040/rpc', // NEO-ONE Node RPC URL
  dbHost: 'localhost',
  dbPort: 5432,
  dbFileName: 'db.sqlite', // Name of file, if needed
  dbClient: 'sqlite3',
  dbConnectionString: process.env.DATABASE_URL, // optional: heroku psql connection
  dbUser: undefined,
  dbPassword: undefined,
  database: 'neotracker_priv',
  resetDB: false, // Resets database
};

const {
  port,
  network: neotrackerNetwork,
  nodeRpcUrl: rpcURL,
  metricsPort,
  resetDB,
  dbHost,
  dbPort,
  dbFileName,
  dbConnectionString,
  dbClient,
  dbUser,
  dbPassword,
  database,
  type,
} = rc('neotracker', defaultNTConfiguration);

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
  dbFileName: path.isAbsolute(dbFileName) ? dbFileName : path.resolve(process.cwd(), dbFileName),
  dbUser,
  dbPassword,
  dbClient,
  dbConnectionString,
  database,
  configuration,
});
const options$ = new BehaviorSubject(options);

const db =
  dbConnectionString !== undefined
    ? {
        connectionString: dbConnectionString,
      }
    : {
        host: dbHost,
        port: dbPort,
      };

const environment = {
  server: {
    react: {
      appVersion: 'dev',
    },
    reactApp: {
      appVersion: 'dev',
    },
    db,
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
    db,
    network,
    pubSub: {},
  },
  start: {
    metricsPort,
    resetDB,
  },
};

export const getConfiguration = () => ({
  environment,
  options$,
  type,
});

import rc from 'rc';
import { HotWebServer } from './HotWebServer';

const ntConfig = rc('neotracker', {
  type: 'all', // Type of NEOTracker instance to start: 'all', 'web', or 'scrape'
  port: 1340, // Port to listen on
  network: 'priv', // Network to run against
  next: false, // Run NEO Tracker Next
  ci: false, // Running as part of continuous integration
  prod: false, // Compile for production
  nodeRpcUrl: 'http://localhost:9040/rpc', // NEO-ONE Node RPC URL
  dbHost: 'localhost',
  dbPort: 5432,
  dbFileName: 'db.sqlite', // Name of file, if needed
  dbClient: 'sqlite3',
  dbUser: undefined,
  dbPassword: undefined,
  database: 'neotracker_priv',
  resetDB: false, // Resets database
});

const server = new HotWebServer({
  env: {
    NEOTRACKER_RESET_DB: ntConfig.resetDB,
    NEOTRACKER_NETWORK: ntConfig.network,
    NEOTRACKER_NEXT: ntConfig.next,
    NEOTRACKER_PORT: ntConfig.port,
    NEOTRACKER_RPC_URL: ntConfig.nodeRpcUrl,
    NEOTRACKER_DB_HOST: ntConfig.dbHost,
    NEOTRACKER_DB_PORT: ntConfig.dbPort,
    NEOTRACKER_DB_FILE: ntConfig.dbFileName,
    NEOTRACKER_DB_CLIENT: ntConfig.dbClient,
    NEOTRACKER_DB: ntConfig.database,
    NEOTRACKER_TYPE: ntConfig.type,
  },
  isCI: ntConfig.ci,
  prod: ntConfig.prod,
});

// tslint:disable-next-line no-floating-promises
server.start();

import * as yargs from 'yargs';
import { HotWebServer } from './HotWebServer';

yargs.describe('network', 'Network to run against.').default('network', 'priv');
yargs.describe('next', 'Run NEO Tracker Next').default('next', false);
yargs.describe('port', 'Port to listen on').default('port', 1340);

const server = new HotWebServer({
  env: {
    NEOTRACKER_NETWORK: yargs.argv.network,
    NEOTRACKER_NEXT: yargs.argv.next,
    NEOTRACKER_PORT: yargs.argv.port,
  },
});

// tslint:disable-next-line no-floating-promises
server.start();

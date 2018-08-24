import * as yargs from 'yargs';
import { HotWebServer } from './HotWebServer';

yargs.describe('network', 'Network to run against.').default('network', 'priv');
yargs.describe('next', 'Run NEO Tracker Next').default('next', false);
yargs.describe('port', 'Port to listen on').default('port', 1340);
yargs.describe('prod', 'Compile for production').default('prod', false);
yargs.describe('ci', 'Running as part of continuous integration').default('ci', false);

const server = new HotWebServer({
  env: {
    NEOTRACKER_NETWORK: yargs.argv.network,
    NEOTRACKER_NEXT: yargs.argv.next,
    NEOTRACKER_PORT: yargs.argv.port,
  },
  isCI: yargs.argv.ci,
  prod: yargs.argv.prod,
});

// tslint:disable-next-line no-floating-promises
server.start();

// tslint:disable no-console
import { createKillProcess } from '@neotracker/server-utils';
import execa from 'execa';
import tmp from 'tmp';
import v4 from 'uuid/v4';
import yargs from 'yargs';
import { checkReady } from '../checkReady';
import { runCypress } from './runCypress';

yargs.describe('ci', 'Running as part of continuous integration.').default('ci', false);

// tslint:disable-next-line readonly-array
const mutableCleanup: Array<() => Promise<void> | void> = [];

// tslint:disable-next-line no-let
let shuttingDown = false;
const shutdown = (exitCode: number) => {
  if (!shuttingDown) {
    shuttingDown = true;
    console.log('Shutting down...');
    Promise.all(mutableCleanup.map((callback) => callback()))
      .then(() => {
        process.exit(exitCode);
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
};

process.on('uncaughtException', (error) => {
  console.error(error);
  shutdown(1);
});

process.on('unhandledRejection', (error) => {
  console.error(error);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT: Exiting...');
  shutdown(0);
});

process.on('SIGTERM', () => {
  console.log('\nSIGTERM: Exiting...');
  shutdown(0);
});

const neoOne = (command: ReadonlyArray<string>): execa.ExecaChildProcess => {
  console.log(`$ neo-one ${command.join(' ')}`);

  return execa('node_modules/.bin/neo-one', command);
};

const run = async ({ ci }: { readonly ci: boolean }) => {
  const networkName = `cypress-${v4()}`;

  await neoOne(['create', 'network', networkName]);
  mutableCleanup.push(async () => {
    await neoOne(['delete', 'network', networkName, '--force']);
  });

  const { stdout } = await neoOne(['describe', 'network', networkName, '--json']);
  const networkInfo = JSON.parse(stdout);
  const rpcURL = networkInfo.nodes[0].rpcAddress;
  const port = 1340;

  await neoOne(['bootstrap', '--network', networkName, '--reset']);

  const proc = execa('yarn', ['develop', '--fast'].concat(ci ? ['--ci'] : []), {
    env: {
      NEOTRACKER_PORT: String(port),
      NEOTRACKER_RPC_URL: rpcURL,
      NEOTRACKER_DB_FILE: tmp.fileSync().name,
    },
  });
  mutableCleanup.push(createKillProcess(proc));

  await checkReady('web', proc, port, { path: 'healthcheck', timeoutMS: 300 * 1000, frequencyMS: 15 * 1000 });

  // Wait for server to startup and sync
  await new Promise<void>((resolve) => setTimeout(resolve, 5000));

  await runCypress({ ci });
};

run({
  ci: yargs.argv.ci,
})
  .then(() => shutdown(0))
  .catch((error) => {
    console.error(error);
    shutdown(1);
  });

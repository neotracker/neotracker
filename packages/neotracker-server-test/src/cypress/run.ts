// tslint:disable no-console
import { createKillProcess } from '@neotracker/server-utils';
import execa from 'execa';
import yargs from 'yargs';
import { checkReady } from '../checkReady';
import { runCypress } from './runCypress';

const { argv } = yargs.describe('ci', 'Running as part of continuous integration.').default('ci', false);

const mutableCleanup: Array<() => void | Promise<void>> = [];

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
  console.log(`$ yarn neo-one ${command.join(' ')}`);

  return execa('yarn', ['neo-one'].concat(command));
};

const run = async ({ ci }: { readonly ci: boolean }) => {
  neoOne(['start', 'network']);
  mutableCleanup.push(async () => {
    await neoOne(['stop', 'network']);
  });
  // Wait for neo-one network to startup
  await new Promise<void>((resolve) => setTimeout(resolve, 10000));
  const port = 1340; // Default NEO•ONE network port

  const proc = execa('yarn', ['develop'].concat(ci ? ['--ci'] : []));
  mutableCleanup.push(createKillProcess(proc));

  await checkReady('web', proc, port, { path: 'healthcheck', timeoutMS: 300 * 1000, frequencyMS: 15 * 1000 });

  // Wait for server to startup and sync
  await new Promise<void>((resolve) => setTimeout(resolve, 5000));

  await runCypress({ ci });
};

run({
  ci: argv.ci,
})
  .then(() => shutdown(0))
  .catch((error) => {
    console.error(error);
    shutdown(1);
  });

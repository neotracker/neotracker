import chokidar from 'chokidar';
import execa from 'execa';
import { log } from '../log';
import { logError } from '../logError';
import { setupProcessListeners } from '../setupProcessListeners';

// tslint:disable-next-line no-let
let running = false;
// tslint:disable-next-line no-let
let shouldRun = false;
const execute = async (force = false) => {
  if (!force && (running || shouldRun)) {
    shouldRun = true;

    return;
  }
  running = true;
  shouldRun = false;

  try {
    const proc = execa('yarn', ['generate-gql-types']);
    if (proc.stdout !== null) {
      proc.stdout.pipe(process.stdout);
    }
    if (proc.stderr !== null) {
      proc.stderr.pipe(process.stderr);
    }

    await proc;
  } catch {
    // do nothing
  }

  running = false;
  if (shouldRun) {
    await execute(true);
  }
};

const title = 'watch-gql-types';
log({ title, message: 'Watching for changes...' });

const watcher = chokidar.watch(['packages', '*', 'src', '**', '*.{ts,tsx}'].join('/'), {
  ignored: ['packages', '*', 'src', '**', '__generated__', '**', '*.{ts,tsx}'].join('/'),
  ignoreInitial: false,
});

// tslint:disable no-unnecessary-callback-wrapper
watcher.on('add', async () => execute());
watcher.on('change', async () => execute());
watcher.on('unlink', async () => execute());
// tslint:enable no-unnecessary-callback-wrapper
watcher.on('error', (error) => {
  logError({ title, error, message: 'Watch error' });
});

const exit = (exitCode: number) => {
  log({ title, message: 'Exiting...' });
  watcher.close();
  process.exit(exitCode);
};

setupProcessListeners({ title, exit });

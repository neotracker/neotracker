// tslint:disable no-console
import * as appRootDir from 'app-root-dir';
import execa from 'execa';

const changedFilesToArray = (files: string) => files.split('\n');

const yarnLock = /yarn\.lock/g;

const doCheck = async (files: string) => {
  const changedFiles = changedFilesToArray(files);
  const lockChanged = changedFiles.some((file) => yarnLock.test(file));
  if (lockChanged) {
    console.log('yarn.lock changed, executing `yarn install`');
    // tslint:disable-next-line no-unused
    const { NODE_OPTIONS, TS_NODE_PROJECT, ...newEnv } = process.env;
    const childProc = execa('yarn', ['install', '--non-interactive', '--frozen-lockfile'], {
      cwd: appRootDir.get(),
      env: newEnv,
      extendEnv: false,
    });
    if (childProc.stdout !== null) {
      childProc.stdout.pipe(process.stdout);
    }
    if (childProc.stderr !== null) {
      childProc.stderr.pipe(process.stderr);
    }
    await childProc;
  }
};

const run = async (gitCommand: string) => {
  const splitCommand = gitCommand.split(' ');
  const { stdout } = await execa(splitCommand[0], splitCommand.slice(1));
  await doCheck(stdout);
};

export const checkForUpdates = (gitCommand: string) => {
  run(gitCommand)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.log('Hook failed, you may need to run `yarn install`');
      console.error(error);
      process.exit(0);
    });
};

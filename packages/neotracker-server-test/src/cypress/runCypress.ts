import execa from 'execa';

export const runCypress = async ({
  ci,
  spec = `cypress/integration/oss/**/*`,
}: {
  readonly ci: boolean;
  readonly spec?: string;
}) => {
  // tslint:disable-next-line no-unused
  const { NODE_OPTIONS, TS_NODE_PROJECT, ...newEnv } = process.env;
  const command = ci
    ? [
        'cypress',
        'run',
        '--reporter',
        'mocha-multi-reporters',
        '--reporter-options',
        'configFile=mocha.json',
        '--spec',
        spec,
      ]
    : ['cypress', 'run', '--spec', spec];

  const proc = execa('yarn', command, {
    env: newEnv,
    extendEnv: false,
  });

  if (proc.stdout !== null) {
    proc.stdout.pipe(process.stdout);
  }
  if (proc.stderr !== null) {
    proc.stderr.pipe(process.stderr);
  }

  await proc;
};

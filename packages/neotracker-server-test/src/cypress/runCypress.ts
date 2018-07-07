import execa from 'execa';

export const runCypress = async ({ ci }: { readonly ci: boolean }) => {
  // tslint:disable-next-line no-unused
  const { NODE_OPTIONS, TS_NODE_PROJECT, ...newEnv } = process.env;
  const command = ci
    ? ['cypress', 'run', '--reporter', 'mocha-multi-reporters', '--reporter-options', 'configFile=mocha.json']
    : ['cypress', 'run'];
  const proc = execa('yarn', command, { env: newEnv, extendEnv: false });

  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);

  await proc;
};

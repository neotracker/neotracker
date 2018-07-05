import execa from 'execa';

export const runCypress = async ({ ci }: { readonly ci: boolean }) => {
  let proc: execa.ExecaChildProcess;
  if (ci) {
    proc = execa('yarn', [
      'cypress',
      'run',
      '--reporter',
      'mocha-multi-reporters',
      '--reporter-options',
      'configFile=mocha.json',
    ]);
  } else {
    proc = execa('yarn', ['cypress', 'run']);
  }

  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);

  await proc;
};

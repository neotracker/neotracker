import execa from 'execa';

export const startNEOONE = async (): Promise<{ readonly proc: execa.ExecaChildProcess }> => {
  const proc = execa('node_modules/.bin/neo-one', ['start', 'server', '--debug', '--static-neo-one']);

  let stdout = '';
  const listener = (res: string) => {
    stdout += res;
  };
  proc.stdout.on('data', listener);

  let tries = 6;
  let ready = false;
  // tslint:disable-next-line no-loop-statement
  while (!ready && tries >= 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, 5000));
    const result = await execa('node_modules/.bin/neo-one', ['check', 'server', '--static-neo-one']);
    try {
      ready = JSON.parse(result.stdout);
    } catch {
      // Ignore errors
    }
    tries -= 1;
  }

  proc.stdout.removeListener('data', listener);

  if (!ready) {
    throw new Error(`Failed to start NEO-ONE server: ${stdout}`);
  }

  return { proc };
};

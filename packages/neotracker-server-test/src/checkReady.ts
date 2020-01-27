import fetch from 'cross-fetch';
import { ExecaChildProcess } from 'execa';
import { until } from './until';

export async function checkReady(
  component: string,
  proc: ExecaChildProcess,
  port: number,
  {
    path = 'ready_health_check',
    timeoutMS = 60000,
    frequencyMS = 1000,
  }: { readonly path?: string; readonly timeoutMS?: number; readonly frequencyMS?: number } = {
    path: 'ready_health_check',
    timeoutMS: 60000,
    frequencyMS: 1000,
  },
) {
  let stdout = '';
  const stdoutListener = (res: string) => {
    stdout += res;
  };
  if (proc.stdout !== null) {
    proc.stdout.on('data', stdoutListener);
  }

  let stderr = '';
  const stderrListener = (res: string) => {
    stderr += res;
  };
  if (proc.stderr !== null) {
    proc.stderr.on('data', stderrListener);
  }

  let exited = proc.killed;
  const handleExit = () => {
    exited = true;
    // tslint:disable-next-line no-console
    console.log(`${component} exited.`);
  };
  proc.on('exit', handleExit);

  try {
    await until(
      async () => {
        if (exited) {
          return;
        }

        // tslint:disable-next-line no-console
        console.log(`Checking if ${component} is ready...`);
        const response = await fetch(`http://localhost:${port}/${path}`);
        if (response.status !== 200) {
          throw Error(`Component ${component} is not ready: ${response.status}. ${response.statusText}`);
        }
      },
      timeoutMS,
      frequencyMS,
    );

    if (exited) {
      throw new Error('Exited');
    }
  } catch (error) {
    throw new Error(`Failed to start ${component}:\nError: ${error.stack}\nstdout: ${stdout}\nstderr:${stderr}`);
  } finally {
    if (proc.stdout !== null) {
      proc.stdout.removeListener('data', stdoutListener);
    }
    if (proc.stderr !== null) {
      proc.stderr.removeListener('data', stderrListener);
    }
    proc.removeListener('exit', handleExit);
  }
}

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
  proc.stdout.on('data', stdoutListener);

  let stderr = '';
  const stderrListener = (res: string) => {
    stderr += res;
  };
  proc.stderr.on('data', stderrListener);

  try {
    await until(
      async () => {
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
  } catch (error) {
    throw new Error(`Failed to start ${component}:\nError: ${error.stack}\nstdout: ${stdout}\nstderr:${stderr}`);
  } finally {
    proc.stdout.removeListener('data', stdoutListener);
    proc.stderr.removeListener('data', stderrListener);
  }
}

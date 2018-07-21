import { utils } from '@neotracker/shared-utils';
import execa from 'execa';
import isRunning from 'is-running';

export const createKillProcess = (proc: execa.ExecaChildProcess) => async () => killProcess(proc);

export const killProcess = async (proc: execa.ExecaChildProcess): Promise<void> => {
  const pid = proc.pid;
  const startTime = utils.nowSeconds();
  let alive = isRunning(pid);
  if (!alive) {
    return;
  }

  // tslint:disable-next-line no-loop-statement
  while (utils.nowSeconds() - startTime <= 10) {
    try {
      let signal = 'SIGINT';
      if (utils.nowSeconds() - startTime > 7) {
        signal = 'SIGKILL';
      } else if (utils.nowSeconds() - startTime > 5) {
        signal = 'SIGTERM';
      }
      process.kill(pid, signal);
    } catch (error) {
      if (error.code === 'ESRCH') {
        return;
      }

      throw error;
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    alive = isRunning(pid);
    if (!alive) {
      return;
    }
  }

  throw new Error(`Failed to kill process ${pid}`);
};

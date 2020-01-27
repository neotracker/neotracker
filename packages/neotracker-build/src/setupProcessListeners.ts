import { log } from './log';
import { logError } from './logError';

export const setupProcessListeners = ({
  title,
  exit,
}: {
  readonly title: string;
  readonly exit: (exitCode: number) => Promise<void> | void;
}) => {
  process.on('uncaughtException', (error) => {
    logError({
      title,
      message: 'Uncaught Exception',
      error,
    });

    exit(1);
  });

  process.on('unhandledRejection', () => {
    logError({
      title,
      message: 'Unhandled Rejection',
    });
  });

  process.on('SIGINT', () => {
    log({ title, message: 'SIGINT: Exiting...' });
    exit(0);
  });

  process.on('SIGTERM', () => {
    log({ title, message: 'SIGTERM: Exiting...' });
    exit(0);
  });
};

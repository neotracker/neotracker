/* @flow */
import log from './log';
import logError from './logError';

export default ({
  title,
  exit,
}: {|
  title: string,
  exit: (exitCode: number) => Promise<void> | void,
|}) => {
  process.on('uncaughtException', error => {
    logError({
      title,
      message: 'Uncaught Exception',
      error,
    });
    exit(1);
  });

  process.on('unhandledRejection', error => {
    logError({
      title,
      message: 'Unhandled Rejection',
      error,
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

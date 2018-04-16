/* @flow */
import log from './log';

export default function logError({
  title,
  message,
  errorMessage,
  error,
}: {
  title: string,
  message: string,
  errorMessage?: string,
  error?: Error,
}): void {
  log({
    title,
    message: `${message} Please check the console for more information.`,
    level: 'error',
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  if (errorMessage != null) {
    log({
      title,
      message: errorMessage,
      level: 'error',
    });
  }
}

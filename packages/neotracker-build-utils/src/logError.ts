import { log } from './log';

export function logError({
  title,
  message,
  errorMessage,
  error,
}: {
  readonly title: string;
  readonly message: string;
  readonly errorMessage?: string;
  readonly error?: Error;
}): void {
  log({
    title,
    message: `${message} Please check the console for more information.`,
    level: 'error',
  });

  if (error) {
    // tslint:disable-next-line no-console
    console.error(error);
  }
  if (errorMessage !== undefined) {
    log({
      title,
      message: errorMessage,
      level: 'error',
    });
  }
}

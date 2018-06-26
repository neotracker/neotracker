import chalk from 'chalk';
import logger from 'fancy-log';

export function log({
  title,
  level = 'info',
  message,
}: {
  readonly title: string;
  readonly level?: 'info' | 'warn' | 'error';
  readonly message: string;
}): void {
  const msg = `==> ${title} -> ${message}`;

  switch (level) {
    case 'warn':
      logger(chalk.yellow(msg));
      break;
    case 'error':
      logger(chalk.bgRed.white(msg));
      break;
    case 'info':
    default:
      logger(chalk.green(msg));
  }
}

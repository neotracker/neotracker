import { topLevelLogger } from '@neotracker/logger';

export function log({
  title,
  level = 'info',
  message,
}: {
  readonly title: string;
  readonly level?: 'info' | 'warn' | 'error';
  readonly message: string;
}): void {
  switch (level) {
    case 'warn':
      topLevelLogger.warn({ title, message });
      break;
    case 'error':
      topLevelLogger.error({ title, message });
      break;
    case 'info':
    default:
      topLevelLogger.info({ title, message });
  }
}

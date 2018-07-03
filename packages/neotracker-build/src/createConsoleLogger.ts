import { LoggerLogOptions } from '@neo-one/monitor';

export const createConsoleLogger = () => ({
  log: (message: LoggerLogOptions) => {
    // tslint:disable-next-line no-console
    console.log(message);
    if (message.error !== undefined) {
      // tslint:disable-next-line no-console
      console.error(message.error);
    }
  },
  close: (callback: (() => void)) => {
    callback();
  },
});

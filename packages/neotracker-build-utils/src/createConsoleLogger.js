/* @flow */
import type { LoggerLogOptions } from '@neo-one/monitor';

export default () => ({
  log: (message: LoggerLogOptions) => {
    // eslint-disable-next-line
    console.log(message);
    if (message.error != null && message.error != null) {
      // eslint-disable-next-line
      console.error(message.error);
    }
  },
  close: (callback: () => void) => {
    callback();
  },
});

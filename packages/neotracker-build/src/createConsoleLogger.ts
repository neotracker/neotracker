import { LoggerLogOptions } from '@neo-one/monitor';
import _ from 'lodash';

export const createConsoleLogger = () => ({
  log: (info: LoggerLogOptions) => {
    const { error, level, name, message, ...rest } = info;
    let output = `${level}: ${name}`;
    if (!_.isEmpty(message)) {
      output += ` ${message}`;
    }
    if (!_.isEmpty(rest)) {
      output += ` ${JSON.stringify(rest)}`;
    }
    if (error !== undefined && error.stack !== undefined) {
      output += `\n${error.stack}`;
    }

    if (level === 'error') {
      // tslint:disable-next-line no-console
      console.error(output);
    } else if (level === 'info') {
      // tslint:disable-next-line no-console
      console.log(output);
    }
  },
  close: (callback: (() => void)) => {
    callback();
  },
});

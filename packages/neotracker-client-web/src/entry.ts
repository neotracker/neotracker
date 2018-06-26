// tslint:disable-next-line no-import-side-effect
import './init';
// tslint:disable-next-line ordered-imports
import { DefaultMonitor } from '@neo-one/monitor';
import { render } from './render';

// tslint:disable-next-line no-any
const log = (message: any) => {
  if (message.error != undefined) {
    // tslint:disable-next-line no-console
    console.error(message.error);
  }
  // tslint:disable-next-line no-console
  console.log(message);
};
const monitor = DefaultMonitor.create({
  service: 'client',
  logger: {
    log,
    close: () => {
      // do nothing
    },
  },
});

render({ monitor });

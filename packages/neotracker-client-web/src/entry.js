/* @flow */
/* eslint-disable import/first */
import './init';

import { DefaultMonitor } from '@neo-one/monitor';

import render from './render';

const log = message => {
  if (message.error != null && message.error != null) {
    // eslint-disable-next-line
    console.error(message.error);
  }
  // eslint-disable-next-line
  console.log(message);
};
const monitor = DefaultMonitor.create({
  service: 'client',
  logger: {
    log,
    close: () => {},
  },
});
render({ monitor });

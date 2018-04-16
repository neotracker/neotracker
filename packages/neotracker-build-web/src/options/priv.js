/* @flow */
import { privDatabase } from 'neotracker-build-utils';

import common from './common';

export default ({ port, rpcURL }: {| port: number, rpcURL: string |}) =>
  common({
    database: privDatabase,
    rpcURL,
    port,
  });

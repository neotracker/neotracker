/* @flow */
import { testDatabase, testRPCURL } from 'neotracker-build-utils';

import common from './common';

export default ({ port }: {| port: number |}) =>
  common({
    database: testDatabase,
    rpcURL: testRPCURL,
    port,
  });

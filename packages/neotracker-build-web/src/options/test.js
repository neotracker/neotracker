/* @flow */
import { testDatabase, testRPCURL } from 'neotracker-build-utils';

import common from './common';

export default common({
  database: testDatabase,
  rpcURL: testRPCURL,
});

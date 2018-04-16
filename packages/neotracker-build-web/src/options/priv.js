/* @flow */
import { privDatabase, privRPCURL } from 'neotracker-build-utils';

import common from './common';

export default common({
  database: privDatabase,
  rpcURL: privRPCURL,
});

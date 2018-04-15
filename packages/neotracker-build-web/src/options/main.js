/* @flow */
import { mainDatabase, mainRPCURL } from 'neotracker-build-utils';

import common from './common';

export default common({
  database: mainDatabase,
  rpcURL: mainRPCURL,
});

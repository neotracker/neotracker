/* @flow */
import { mainDatabase, mainRPCURL } from 'neotracker-build-utils';

import common from './common';

export default ({ port }: {| port: number |}) =>
  common({
    database: mainDatabase,
    rpcURL: mainRPCURL,
    port,
  });

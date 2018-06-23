/* @flow */
import { getNetworkOptions, getPrivRPCURL } from 'neotracker-build-utils';

import main from './main';
import priv from './priv';
import test from './test';

export { default as main } from './main';
export { default as priv } from './priv';
export { default as test } from './test';

export const getOptions = ({ port }: {| port: number |}) =>
  getNetworkOptions({
    main: main({ port }),
    test: test({ port }),
    priv: priv({
      rpcURL: getPrivRPCURL(),
      port,
    }),
  });

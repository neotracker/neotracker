import { getNetworkOptions, getPrivRPCURL } from 'neotracker-build-utils';
import { main } from './main';
import { priv } from './priv';
import { test } from './test';

export { main } from './main';
export { priv } from './priv';
export { test } from './test';

// tslint:disable-next-line export-name
export const getOptions = ({ port }: { readonly port: number }) =>
  getNetworkOptions({
    main: main({ port }),
    test: test({ port }),
    priv: priv({
      rpcURL: getPrivRPCURL(),
      port,
    }),
  });

import { AssetsConfiguration } from './common';
import { main } from './main';
import { priv } from './priv';
import { test } from './test';
import { getNetworkOptions } from './utils';

export { AssetsConfiguration };
export { main } from './main';
export { priv } from './priv';
export { test } from './test';

// tslint:disable-next-line export-name
export const getOptions = ({
  network,
  port,
  dbFileName,
  configuration,
  rpcURL,
}: {
  readonly network?: string;
  readonly port: number;
  readonly dbFileName: string;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
}) =>
  getNetworkOptions({
    network,
    main: main({
      port,
      dbFileName,
      configuration,
      rpcURL,
    }),
    test: test({
      port,
      dbFileName,
      configuration,
      rpcURL,
    }),
    priv: priv({
      port,
      dbFileName,
      configuration,
      rpcURL,
    }),
  });

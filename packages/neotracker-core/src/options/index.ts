import { LiteDBConfig, PGDBConfig, PGDBConfigString } from '../getConfiguration';
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
  db,
  configuration,
  rpcURL,
  googleAnalyticsTag,
  externalRpcUrl,
}: {
  readonly network?: string;
  readonly port: number;
  readonly db: LiteDBConfig | PGDBConfig | PGDBConfigString;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
  readonly googleAnalyticsTag: string;
  readonly externalRpcUrl: string;
}) =>
  getNetworkOptions({
    network,
    main: main({
      port,
      db,
      configuration,
      rpcURL,
      googleAnalyticsTag,
      externalRpcUrl,
    }),
    test: test({
      port,
      db,
      configuration,
      rpcURL,
      googleAnalyticsTag,
      externalRpcUrl,
    }),
    priv: priv({
      port,
      db,
      configuration,
      rpcURL,
      googleAnalyticsTag,
      externalRpcUrl,
    }),
  });

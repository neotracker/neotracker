import { DBClient } from '@neotracker/server-db';
import { AssetsConfiguration } from './common';
import { main } from './main';
import { priv } from './priv';
import { test } from './test';
import { getNetworkOptions } from './utils';
import { LiteDBConfig, PGDBConfig, PGDBConfigString } from '../getConfiguration';

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
}: {
  readonly network?: string;
  readonly port: number;
  readonly db: LiteDBConfig | PGDBConfig | PGDBConfigString;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
}) =>
  getNetworkOptions({
    network,
    main: main({
      port,
      db,
      configuration,
      rpcURL,
    }),
    test: test({
      port,
      db,
      configuration,
      rpcURL,
    }),
    priv: priv({
      port,
      db,
      configuration,
      rpcURL,
    }),
  });

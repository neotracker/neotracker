import { DBClient } from '@neotracker/server-db';
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
  dbUser,
  dbPassword,
  dbClient,
  dbConnectionString,
  database,
  configuration,
  rpcURL,
}: {
  readonly network?: string;
  readonly port: number;
  readonly dbFileName: string;
  readonly dbUser?: string;
  readonly dbPassword?: string;
  readonly dbClient?: DBClient;
  readonly dbConnectionString?: string;
  readonly database?: string;
  readonly configuration: AssetsConfiguration;
  readonly rpcURL?: string;
}) =>
  getNetworkOptions({
    network,
    main: main({
      port,
      dbFileName,
      dbUser,
      dbPassword,
      dbClient,
      dbConnectionString,
      configuration,
      rpcURL,
    }),
    test: test({
      port,
      dbFileName,
      dbUser,
      dbPassword,
      dbClient,
      dbConnectionString,
      configuration,
      rpcURL,
    }),
    priv: priv({
      port,
      dbFileName,
      dbUser,
      dbPassword,
      dbClient,
      dbConnectionString,
      database,
      configuration,
      rpcURL,
    }),
  });

/* @flow */
import {
  type DBEnvironment,
  type DBOptions,
  type RootLoaderOptions,
  Address as AddressModel,
  Asset as AssetModel,
  Block as BlockModel,
  Contract as ContractModel,
  createRootLoader$,
  createFromEnvironment$,
  isHealthyDB,
} from 'neotracker-server-db';
import {
  type NetworkType,
  ReadClient,
  NEOONEDataProvider,
} from '@neo-one/client';
import BigNumber from 'bignumber.js';
import type { Monitor } from '@neo-one/monitor';
import { Observable, combineLatest, concat, of as _of, timer } from 'rxjs';

import {
  concatMap,
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
  switchMap,
} from 'rxjs/operators';

import type {
  AddressSave,
  AssetSave,
  Context,
  ContractSave,
  SystemFeeSave,
} from './types';
import MigrationHandler from './MigrationHandler';
import WriteCache from './WriteCache';

import migrations from './migrations';
import run$ from './run$';

export type Environment = {|
  network: NetworkType,
  db: DBEnvironment,
|};
export type Options = {|
  db: DBOptions,
  rootLoader: RootLoaderOptions,
  rpcURL: string,
  migrationEnabled: boolean,
  nep5Hashes: Array<string>,
  repairNEP5BlockFrequency: number,
  repairNEP5LatencySeconds: number,
|};

export default ({
  monitor: monitorIn,
  environment,
  options$,
}: {|
  monitor: Monitor,
  environment: Environment,
  options$: Observable<Options>,
|}): Observable<boolean> => {
  const rootMonitor = monitorIn.at('scrape');
  const rootLoader$ = createRootLoader$({
    db$: createFromEnvironment$({
      monitor: rootMonitor,
      environment: environment.db,
      options$: options$.pipe(
        map(options => options.db),
        distinctUntilChanged(),
      ),
    }),
    options$: options$.pipe(
      map(options => options.rootLoader),
      distinctUntilChanged(),
    ),
    monitor: rootMonitor,
  }).pipe(
    publishReplay(1),
    refCount(),
  );

  const client$ = options$.pipe(
    map(options => options.rpcURL),
    distinctUntilChanged(),
    map(
      rpcURL =>
        new ReadClient(
          new NEOONEDataProvider({
            network: environment.network,
            rpcURL,
          }),
        ),
    ),
    publishReplay(1),
    refCount(),
  );

  const scrape$ = combineLatest(
    client$,
    rootLoader$,
    options$.pipe(
      map(options => options.migrationEnabled),
      distinctUntilChanged(),
    ),
    options$.pipe(
      map(options => options.repairNEP5BlockFrequency),
      distinctUntilChanged(),
    ),
    options$.pipe(
      map(options => options.repairNEP5LatencySeconds),
      distinctUntilChanged(),
    ),
  ).pipe(
    map(
      ([
        client,
        rootLoader,
        migrationEnabled,
        repairNEP5BlockFrequency,
        repairNEP5LatencySeconds,
      ]) => {
        const makeQueryContext = rootLoader.makeAllPowerfulQueryContext;
        const address = new WriteCache({
          fetch: (key: string, monitor: Monitor) =>
            AddressModel.query(rootLoader.db)
              .context(makeQueryContext(monitor))
              .where('id', key)
              .first()
              .execute(),
          create: ({ hash, transactionModel }: AddressSave, monitor: Monitor) =>
            AddressModel.query(rootLoader.db)
              .context(makeQueryContext(monitor))
              .insert({
                id: hash,
                transaction_id:
                  transactionModel == null ? null : transactionModel.id,
                transaction_hash:
                  transactionModel == null ? null : transactionModel.hash,
                block_id:
                  transactionModel == null ? null : transactionModel.block_id,
                block_time:
                  transactionModel == null
                    ? 1468595301
                    : transactionModel.block_time,
              })
              .first()
              .returning('*')
              .execute(),
          getKey: (key: string) => key,
          getKeyFromSave: ({ hash }: AddressSave) => hash,
        });

        const getAssetID = ({ transactionModel, hash }: AssetSave) =>
          hash == null ? transactionModel.hash : hash;

        const getAssetDB = async (assetSave: AssetSave, monitor: Monitor) => {
          const { asset, transactionModel } = assetSave;
          let adminAddress;
          if (asset.admin != null) {
            adminAddress = await address.save(
              {
                hash: asset.admin,
                transactionModel,
              },
              monitor,
            );
          }
          return {
            id: getAssetID(assetSave),
            transaction_id: transactionModel.id,
            transaction_hash: transactionModel.hash,
            type: asset.type,
            name_raw: JSON.stringify(asset.name),
            symbol:
              asset.symbol == null ? JSON.stringify(asset.name) : asset.symbol,
            amount: asset.amount,
            precision: asset.precision,
            owner: asset.owner,
            admin_address_id: adminAddress == null ? null : adminAddress.id,
            block_time: transactionModel.block_time,
          };
        };

        const { db } = rootLoader;
        return {
          db,
          makeQueryContext,
          client,
          prevBlock: null,
          currentHeight: null,
          address,
          asset: new WriteCache({
            fetch: (key: string, monitor: Monitor) =>
              AssetModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .where('id', key)
                .first()
                .execute(),
            create: async (save: AssetSave, monitor: Monitor) => {
              const assetDB = await getAssetDB(save, monitor);
              return AssetModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .insert(assetDB)
                .first()
                .returning('*')
                .execute();
            },
            getKey: (key: string) => key,
            getKeyFromSave: (assetSave: AssetSave) => getAssetID(assetSave),
          }),
          contract: new WriteCache({
            fetch: (key: string, monitor: Monitor) =>
              ContractModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .where('id', key)
                .first()
                .execute(),
            create: async (
              { contract, blockModel, transactionModel }: ContractSave,
              monitor: Monitor,
            ) =>
              ContractModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .insert({
                  id: contract.hash,
                  script: contract.script,
                  parameters_raw: JSON.stringify(contract.parameters),
                  return_type: contract.returnType,
                  needs_storage: contract.properties.storage,
                  name: contract.name,
                  version: contract.codeVersion,
                  author: contract.author,
                  email: contract.email,
                  description: contract.description,
                  transaction_id: transactionModel.id,
                  transaction_hash: transactionModel.hash,
                  block_time: transactionModel.block_time,
                  block_id: blockModel.id,
                }),
            getKey: (key: string) => key,
            getKeyFromSave: ({ contract }: ContractSave) => contract.hash,
          }),
          systemFee: new WriteCache({
            fetch: (index: number, monitor: Monitor) =>
              BlockModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .where('id', index)
                .first()
                .then(
                  result =>
                    result == null
                      ? null
                      : new BigNumber(result.aggregated_system_fee),
                ),
            // eslint-disable-next-line
            create: ({ value }: SystemFeeSave, monitor: Monitor) =>
              Promise.resolve(value),
            getKey: (index: number) => `${index}`,
            getKeyFromSave: ({ index }: SystemFeeSave) => index,
          }),
          contractModelsToProcess: [],
          nep5Contracts: {},
          migrationHandler: new MigrationHandler({
            enabled: migrationEnabled,
            db,
            monitor: rootMonitor,
            makeQueryContext,
          }),
          nep5Hashes$: options$.pipe(
            map(options => options.nep5Hashes),
            distinctUntilChanged(),
          ),
          repairNEP5BlockFrequency,
          repairNEP5LatencySeconds,
        };
      },
    ),
    concatMap(async (context: Context) => {
      for (const [name, migration] of migrations) {
        // eslint-disable-next-line
        const execute = await context.migrationHandler.shouldExecute(name);
        if (execute) {
          // eslint-disable-next-line
          await migration(context, rootMonitor, name);
          // eslint-disable-next-line
          await context.migrationHandler.onComplete(name);
        }
      }

      return context;
    }),
    switchMap((context: Context) => run$(context, rootMonitor)),
  );

  return combineLatest(rootLoader$, concat(_of(null), scrape$)).pipe(
    // eslint-disable-next-line
    switchMap(([rootLoader, _]) =>
      timer(0, 5000).pipe(
        switchMap(() => isHealthyDB(rootLoader.db, rootMonitor)),
      ),
    ),
  );
};

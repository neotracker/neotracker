import { NEOONEDataProvider, NetworkType, ReadClient } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import {
  Address as AddressModel,
  Asset as AssetModel,
  Block as BlockModel,
  Contract as ContractModel,
  createFromEnvironment$,
  createRootLoader$,
  DBEnvironment,
  DBOptions,
  isHealthyDB,
  RootLoaderOptions,
} from 'neotracker-server-db';
import { mergeScanLatest } from 'neotracker-shared-utils';
import { combineLatest, concat, Observable, of as _of, timer } from 'rxjs';
import { distinctUntilChanged, map, publishReplay, refCount, switchMap } from 'rxjs/operators';
import { MigrationHandler } from './MigrationHandler';
import { migrations } from './migrations';
import { run$ } from './run$';
import { AddressSave, AssetSave, Context, ContractSave, SystemFeeSave } from './types';
import { WriteCache } from './WriteCache';

export interface Environment {
  readonly network: NetworkType;
  readonly db: DBEnvironment;
}
export interface Options {
  readonly db: DBOptions;
  readonly rootLoader: RootLoaderOptions;
  readonly rpcURL: string;
  readonly migrationEnabled: boolean;
  readonly blacklistNEP5Hashes: ReadonlyArray<string>;
  readonly repairNEP5BlockFrequency: number;
  readonly repairNEP5LatencySeconds: number;
}

export const createScraper$ = ({
  monitor: monitorIn,
  environment,
  options$,
}: {
  readonly monitor: Monitor;
  readonly environment: Environment;
  readonly options$: Observable<Options>;
}): Observable<boolean> => {
  const rootMonitor = monitorIn.at('scrape');
  const rootLoader$ = createRootLoader$({
    db$: createFromEnvironment$({
      monitor: rootMonitor,
      environment: environment.db,
      options$: options$.pipe(
        map((options) => options.db),
        distinctUntilChanged(),
      ),
    }),

    options$: options$.pipe(
      map((options) => options.rootLoader),
      distinctUntilChanged(),
    ),

    monitor: rootMonitor,
  }).pipe(
    publishReplay(1),
    refCount(),
  );

  const client$ = options$.pipe(
    map((options) => options.rpcURL),
    distinctUntilChanged(),
    map(
      (rpcURL) =>
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
      map((options) => options.migrationEnabled),
      distinctUntilChanged(),
    ),

    options$.pipe(
      map((options) => options.repairNEP5BlockFrequency),
      distinctUntilChanged(),
    ),

    options$.pipe(
      map((options) => options.repairNEP5LatencySeconds),
      distinctUntilChanged(),
    ),
  ).pipe(
    map(
      ([client, rootLoader, migrationEnabled, repairNEP5BlockFrequency, repairNEP5LatencySeconds]): Context => {
        const makeQueryContext = rootLoader.makeAllPowerfulQueryContext;
        const address = new WriteCache({
          fetch: async (key: string, monitor) =>
            AddressModel.query(rootLoader.db)
              .context(makeQueryContext(monitor))
              .where('id', key)
              .first()
              .execute(),
          create: async ({ hash, transactionModel }: AddressSave, monitor) =>
            AddressModel.query(rootLoader.db)
              .context(makeQueryContext(monitor))
              .insert({
                id: hash,
                transaction_id: transactionModel === undefined ? undefined : transactionModel.id,
                transaction_hash: transactionModel === undefined ? undefined : transactionModel.hash,
                block_id: transactionModel === undefined ? undefined : transactionModel.block_id,
                block_time: transactionModel === undefined ? 1468595301 : transactionModel.block_time,
              })
              .first()
              .returning('*')
              .throwIfNotFound()
              .execute(),
          getKey: (key: string) => key,
          getKeyFromSave: ({ hash }: AddressSave) => hash,
        });

        const getAssetID = ({ transactionModel, hash }: AssetSave) =>
          hash === undefined ? transactionModel.hash : hash;

        const getAssetDB = async (assetSave: AssetSave, monitor: Monitor): Promise<Partial<AssetModel>> => {
          const { asset, transactionModel } = assetSave;
          let adminAddress;
          if (asset.admin !== undefined) {
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
            symbol: asset.symbol === undefined ? JSON.stringify(asset.name) : asset.symbol,
            amount: asset.amount,
            precision: asset.precision,
            owner: asset.owner,
            admin_address_id: adminAddress === undefined ? undefined : adminAddress.id,
            block_time: transactionModel.block_time,
          };
        };

        const { db } = rootLoader;

        return {
          db,
          makeQueryContext,
          client,
          prevBlock: undefined,
          currentHeight: undefined,
          address,
          asset: new WriteCache({
            fetch: async (key: string, monitor) =>
              AssetModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .where('id', key)
                .first()
                .execute(),
            create: async (save: AssetSave, monitor) => {
              const assetDB = await getAssetDB(save, monitor);

              return AssetModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .insert(assetDB)
                .returning('*')
                .first()
                .throwIfNotFound()
                .execute();
            },
            getKey: (key: string) => key,
            getKeyFromSave: getAssetID,
          }),
          contract: new WriteCache({
            fetch: async (key: string, monitor) =>
              ContractModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .where('id', key)
                .first()
                .execute(),
            create: async ({ contract, blockModel, transactionModel }: ContractSave, monitor) =>
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
                })
                .returning('*')
                .first()
                .throwIfNotFound(),

            getKey: (key: string) => key,
            getKeyFromSave: ({ contract }: ContractSave) => contract.hash,
          }),
          systemFee: new WriteCache({
            fetch: async (index: number, monitor) =>
              BlockModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .where('id', index)
                .first()
                .then((result) => (result === undefined ? undefined : new BigNumber(result.aggregated_system_fee))),
            create: async ({ value }: SystemFeeSave) => Promise.resolve(new BigNumber(value)),
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
          blacklistNEP5Hashes$: options$.pipe(
            map((options) => options.blacklistNEP5Hashes),
            distinctUntilChanged(),
          ),
          repairNEP5BlockFrequency,
          repairNEP5LatencySeconds,
        };
      },
    ),
    mergeScanLatest(async (_acc, context: Context) => {
      // tslint:disable-next-line no-loop-statement
      for (const [name, migration] of migrations) {
        const execute = await context.migrationHandler.shouldExecute(name);
        if (execute) {
          await migration(context, rootMonitor, name);
          await context.migrationHandler.onComplete(name);
        }
      }

      return context;
    }),
    switchMap((context: Context) => run$(context, rootMonitor)),
  );

  return combineLatest(rootLoader$, concat(_of(undefined), scrape$)).pipe(
    // tslint:disable-next-line no-unused
    switchMap(([rootLoader, _]) => timer(0, 5000).pipe(switchMap(async () => isHealthyDB(rootLoader.db, rootMonitor)))),
  );
};

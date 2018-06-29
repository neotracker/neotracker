import { NEOONEDataProvider, NetworkType, ReadClient } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import {
  Address as AddressModel,
  Asset as AssetModel,
  Block as BlockModel,
  Contract as ContractModel,
  createFromEnvironment$,
  createProcessedNextIndexPubSub,
  createRootLoader$,
  DBEnvironment,
  DBOptions,
  isHealthyDB,
  PubSub,
  PubSubEnvironment,
  PubSubOptions,
  RootLoaderOptions,
} from 'neotracker-server-db';
import { mergeScanLatest } from 'neotracker-shared-utils';
import { combineLatest, concat, Observable, of as _of, timer } from 'rxjs';
import { distinctUntilChanged, map, publishReplay, refCount, switchMap } from 'rxjs/operators';
import { BlockUpdater, KnownContractUpdater } from './db';
import { ContractActionUpdater } from './db/ContractActionUpdater';
import { MigrationHandler } from './MigrationHandler';
import { migrations } from './migrations';
import { run$ } from './run$';
import { AddressRevert, AddressSave, AssetSave, Context, ContractSave, SystemFeeSave } from './types';
import { WriteCache } from './WriteCache';

export interface Environment {
  readonly network: NetworkType;
  readonly db: DBEnvironment;
  readonly pubSub: PubSubEnvironment;
}
export interface Options {
  readonly db: DBOptions;
  readonly rootLoader: RootLoaderOptions;
  readonly rpcURL: string;
  readonly migrationEnabled: boolean;
  readonly blacklistNEP5Hashes: ReadonlyArray<string>;
  readonly repairNEP5BlockFrequency: number;
  readonly repairNEP5LatencySeconds: number;
  readonly chunkSize?: number;
  readonly pubSub: PubSubOptions;
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

  const processedIndexPubSub$ = options$.pipe(
    map((options) => options.pubSub),
    distinctUntilChanged(),
    // tslint:disable-next-line no-unnecessary-type-annotation
    mergeScanLatest(async (prev: PubSub<{ readonly index: number }> | undefined, pubSubOptions) => {
      if (prev !== undefined) {
        prev.close();
      }

      return createProcessedNextIndexPubSub({
        options: pubSubOptions,
        environment: environment.pubSub,
        monitor: rootMonitor,
      });
    }),
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
    combineLatest(
      options$.pipe(
        map((options) => options.chunkSize),
        distinctUntilChanged(),
      ),
      processedIndexPubSub$,
    ),
  ).pipe(
    map(
      ([
        client,
        rootLoader,
        migrationEnabled,
        repairNEP5BlockFrequency,
        repairNEP5LatencySeconds,
        [chunkSize = 1000, processedIndexPubSub],
      ]): Context => {
        const makeQueryContext = rootLoader.makeAllPowerfulQueryContext;
        const driverName = rootLoader.db.client.driverName;
        const address = new WriteCache({
          driverName,
          fetch: async (key: string, monitor) =>
            AddressModel.query(rootLoader.db)
              .context(makeQueryContext(monitor))
              .where('id', key)
              .first()
              .execute(),
          create: async ({ hash, transactionID, transactionHash, blockIndex, blockTime }: AddressSave, monitor) =>
            AddressModel.query(rootLoader.db)
              .context(makeQueryContext(monitor))
              .insert({
                id: hash,
                transaction_id: transactionID,
                transaction_hash: transactionHash,
                block_id: blockIndex,
                block_time: blockTime,
              })
              .first()
              .returning('*')
              .throwIfNotFound()
              .execute(),
          revert: async ({ hash, blockIndex, transactionID }: AddressRevert, monitor, trx): Promise<void> => {
            const addressModel = await address.get(hash, monitor);
            if (
              addressModel !== undefined &&
              ((addressModel.transaction_id === undefined && addressModel.block_id === blockIndex) ||
                addressModel.transaction_id === transactionID)
            ) {
              await AddressModel.query(trx === undefined ? rootLoader.db : trx)
                .context(makeQueryContext(monitor))
                .where('id', hash)
                .delete();
            }
          },
          getKey: (key: string) => key,
          getKeyFromSave: ({ hash }: AddressSave) => hash,
          getKeyFromRevert: ({ hash }: AddressRevert) => hash,
        });

        const getAssetID = ({ transactionHash, hash }: AssetSave) => (hash === undefined ? transactionHash : hash);

        const getAssetDB = async (assetSave: AssetSave, monitor: Monitor): Promise<Partial<AssetModel>> => {
          const { asset, transactionHash, transactionID, blockIndex, blockTime } = assetSave;
          let adminAddress;
          if (asset.admin !== undefined) {
            adminAddress = await address.save(
              {
                hash: asset.admin,
                transactionID,
                transactionHash,
                blockIndex,
                blockTime,
              },

              monitor,
            );
          }

          return {
            id: getAssetID(assetSave),
            transaction_id: transactionID,
            transaction_hash: transactionHash,
            type: asset.type,
            name_raw: JSON.stringify(asset.name),
            symbol: asset.symbol === undefined ? JSON.stringify(asset.name) : asset.symbol,
            amount: asset.amount,
            precision: asset.precision,
            owner: asset.owner,
            admin_address_id: adminAddress === undefined ? undefined : adminAddress.id,
            block_time: blockTime,
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
            driverName,
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
            revert: async (key: string, monitor, trx): Promise<void> => {
              await AssetModel.query(trx === undefined ? rootLoader.db : trx)
                .context(makeQueryContext(monitor))
                .where('id', key)
                .delete();
            },
            getKey: (key: string) => key,
            getKeyFromSave: getAssetID,
            getKeyFromRevert: (key: string) => key,
          }),
          contract: new WriteCache({
            driverName,
            fetch: async (key: string, monitor) =>
              ContractModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .where('id', key)
                .first()
                .execute(),
            create: async (
              { contract, transactionID, transactionHash, blockTime, blockIndex }: ContractSave,
              monitor,
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
                  transaction_id: transactionID,
                  transaction_hash: transactionHash,
                  block_time: blockTime,
                  block_id: blockIndex,
                })
                .returning('*')
                .first()
                .throwIfNotFound(),
            revert: async (key: string, monitor, trx): Promise<void> => {
              await ContractModel.query(trx === undefined ? rootLoader.db : trx)
                .context(makeQueryContext(monitor))
                .where('id', key)
                .delete();
            },
            getKey: (key: string) => key,
            getKeyFromSave: ({ contract }: ContractSave) => contract.hash,
            getKeyFromRevert: (key: string) => key,
          }),
          systemFee: new WriteCache({
            driverName,
            fetch: async (index: number, monitor) =>
              BlockModel.query(rootLoader.db)
                .context(makeQueryContext(monitor))
                .where('id', index)
                .first()
                .then((result) => (result === undefined ? undefined : new BigNumber(result.aggregated_system_fee))),
            create: async ({ value }: SystemFeeSave) => Promise.resolve(new BigNumber(value)),
            revert: async (_index: number, _monitor) => {
              // do nothing
            },
            getKey: (index: number) => `${index}`,
            getKeyFromSave: ({ index }: SystemFeeSave) => index,
            getKeyFromRevert: (index: number) => index,
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
          chunkSize,
          processedIndexPubSub,
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
    switchMap((context: Context) =>
      run$(
        context,
        rootMonitor,
        new BlockUpdater(context),
        new ContractActionUpdater(context),
        new KnownContractUpdater(context),
      ),
    ),
  );

  return combineLatest(rootLoader$, concat(_of(undefined), scrape$)).pipe(
    // tslint:disable-next-line no-unused
    switchMap(([rootLoader, _]) => timer(0, 5000).pipe(switchMap(async () => isHealthyDB(rootLoader.db, rootMonitor)))),
  );
};

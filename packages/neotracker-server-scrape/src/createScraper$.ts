import {
  Client,
  LocalKeyStore,
  LocalMemoryStore,
  LocalUserAccountProvider,
  NEOONEDataProvider,
  NEOONEProvider,
  nep5,
  NetworkType,
  ReadClient,
} from '@neo-one/client-full';
import {
  Block as BlockModel,
  Contract as ContractModel,
  createFromEnvironment$,
  createProcessedNextIndexPubSub,
  createRootLoader$,
  DBOptions,
  isHealthyDB,
  NEP5_CONTRACT_TYPE,
  PubSub,
  PubSubOptions,
  RootLoaderOptions,
} from '@neotracker/server-db';
import { mergeScanLatest } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { combineLatest, concat, Observable, of as _of, timer } from 'rxjs';
import { distinctUntilChanged, map, publishReplay, refCount, switchMap } from 'rxjs/operators';
import { BlockUpdater } from './db';
import { MigrationHandler } from './MigrationHandler';
import { migrations } from './migrations';
import { run$ } from './run$';
import { Context, SystemFeeSave } from './types';
import { add0x } from './utils';
import { WriteCache } from './WriteCache';

export interface Environment {
  readonly network: NetworkType;
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
  environment,
  options$,
}: {
  readonly environment: Environment;
  readonly options$: Observable<Options>;
}): Observable<boolean> => {
  const rootLoader$ = createRootLoader$({
    db$: createFromEnvironment$({
      options$: options$.pipe(
        map((options) => options.db),
        distinctUntilChanged(),
      ),
    }),
    options$: options$.pipe(
      map((options) => options.rootLoader),
      distinctUntilChanged(),
    ),
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
  const fullClient$ = options$.pipe(
    map((options) => options.rpcURL),
    distinctUntilChanged(),
    map(
      (rpcURL) =>
        new Client({
          memory: new LocalUserAccountProvider({
            keystore: new LocalKeyStore(new LocalMemoryStore()),
            provider: new NEOONEProvider([
              new NEOONEDataProvider({
                network: environment.network,
                rpcURL,
              }),
            ]),
          }),
        }),
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
      });
    }),
  );

  const scrape$ = combineLatest([
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
    combineLatest([
      options$.pipe(
        map((options) => options.chunkSize),
        distinctUntilChanged(),
      ),
      processedIndexPubSub$,
      options$.pipe(
        map((options) => options.blacklistNEP5Hashes),
        distinctUntilChanged(),
      ),
      fullClient$,
    ]),
  ]).pipe(
    map(
      ([
        client,
        rootLoader,
        migrationEnabled,
        repairNEP5BlockFrequency,
        repairNEP5LatencySeconds,
        [chunkSize = 1000, processedIndexPubSub, blacklistNEP5Hashes, fullClient],
      ]): Context => {
        const makeQueryContext = rootLoader.makeAllPowerfulQueryContext;
        const { db } = rootLoader;

        return {
          db,
          makeQueryContext,
          fullClient,
          client,
          prevBlockData: undefined,
          currentHeight: undefined,
          systemFee: new WriteCache({
            db,
            fetch: async (index: number) =>
              BlockModel.query(rootLoader.db)
                .context(makeQueryContext())
                .where('id', index)
                .first()
                .then((result) => (result === undefined ? undefined : new BigNumber(result.aggregated_system_fee))),
            create: async ({ value }: SystemFeeSave) => Promise.resolve(new BigNumber(value)),
            revert: async (_index: number) => {
              await Promise.resolve();
            },
            getKey: (index: number) => `${index}`,
            getKeyFromSave: ({ index }: SystemFeeSave) => index,
            getKeyFromRevert: (index: number) => index,
          }),
          nep5Contracts: {},
          migrationHandler: new MigrationHandler({
            enabled: migrationEnabled,
            db,
            makeQueryContext,
          }),
          blacklistNEP5Hashes: new Set(blacklistNEP5Hashes),
          repairNEP5BlockFrequency,
          repairNEP5LatencySeconds,
          chunkSize,
          processedIndexPubSub,
          network: environment.network,
        };
      },
    ),
    mergeScanLatest<Context, Context>(async (_acc, context: Context) => {
      const contractModels = await ContractModel.query(context.db)
        .context(context.makeQueryContext())
        .where('type', NEP5_CONTRACT_TYPE);

      const nep5ContractPairs = await Promise.all(
        contractModels
          .filter((contractModel) => !context.blacklistNEP5Hashes.has(contractModel.id))
          .map<Promise<[string, nep5.NEP5SmartContract]>>(async (contractModel) => {
            const contractAddress = add0x(contractModel.id);
            const networks = {
              [environment.network]: {
                address: contractAddress,
              },
            };
            const decimals = await nep5.getDecimals(context.fullClient, networks, environment.network).catch(() => 8);
            const contract = nep5.createNEP5SmartContract(context.fullClient, networks, decimals);

            return [contractModel.id, contract];
          }),
      );

      return {
        ...context,
        nep5Contracts: _.fromPairs(nep5ContractPairs),
      };
    }),
    mergeScanLatest<Context, Context>(async (_acc, context: Context) => {
      // tslint:disable-next-line no-loop-statement
      for (const [name, migration] of migrations) {
        const execute = await context.migrationHandler.shouldExecute(name);
        if (execute) {
          await migration(context, name);
          await context.migrationHandler.onComplete(name);
        }
      }

      return context;
    }),
    switchMap((context: Context) => run$(context, new BlockUpdater())),
  );

  return combineLatest([rootLoader$, concat(_of(undefined), scrape$)]).pipe(
    switchMap(([rootLoader]) => timer(0, 5000).pipe(switchMap(async () => isHealthyDB(rootLoader.db)))),
  );
};

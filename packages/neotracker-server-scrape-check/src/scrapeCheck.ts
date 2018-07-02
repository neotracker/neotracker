import {
  abi,
  addressToScriptHash,
  NEOONEDataProvider,
  NetworkType,
  ReadClient,
  ReadSmartContract,
} from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import Knex from 'knex';
import * as _ from 'lodash';
import {
  Asset as AssetModel,
  Coin as CoinModel,
  createFromEnvironment,
  DBEnvironment,
  DBOptions,
  makeAllPowerfulQueryContext,
  NEP5_CONTRACT_TYPE,
  ProcessedIndex,
} from 'neotracker-server-db';
import { utils } from 'neotracker-shared-utils';

export interface Environment {
  readonly network: NetworkType;
  readonly db: DBEnvironment;
}
export interface Options {
  readonly db: DBOptions;
  readonly rpcURL: string;
  readonly maxBlockOffset: number;
  readonly coinMismatchBatchSize: number;
}

const add0x = (value: string): string => (value.startsWith('0x') ? value : `0x${value}`);

const getSmartContract = async ({
  asset,
  client,
}: {
  readonly asset: string;
  readonly client: ReadClient<NEOONEDataProvider>;
}): Promise<ReadSmartContract> => {
  const nep5ABI = await abi.NEP5({ client, hash: add0x(asset) });

  return client.smartContract({ hash: add0x(asset), abi: nep5ABI });
};

const getSmartContracts = async ({
  monitor,
  db,
  client,
}: {
  readonly monitor: Monitor;
  readonly db: Knex;
  readonly client: ReadClient<NEOONEDataProvider>;
}): Promise<{ readonly [asset: string]: ReadSmartContract }> => {
  const nep5Assets = await AssetModel.query(db)
    .context(makeAllPowerfulQueryContext(monitor))
    .where('type', NEP5_CONTRACT_TYPE);
  const nep5Hashes = nep5Assets.map((asset) => asset.id);
  const smartContractArray = await Promise.all(
    nep5Hashes.map(async (nep5Hash) => getSmartContract({ asset: nep5Hash, client })),
  );

  return utils.zip(nep5Hashes, smartContractArray).reduce<{ readonly [asset: string]: ReadSmartContract }>(
    (acc, [nep5Hash, smartContract]) => ({
      ...acc,
      [nep5Hash]: smartContract,
    }),
    {},
  );
};

const getSystemCoinBalance = async ({
  address,
  asset,
  client,
  monitor,
}: {
  readonly address: string;
  readonly asset: string;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly monitor: Monitor;
}): Promise<BigNumber | undefined> => {
  const account = await client.getAccount(address, monitor);

  return account.balances[add0x(asset)];
};

const getNEP5CoinBalance = async ({
  smartContracts,
  address,
  asset,
}: {
  readonly smartContracts: { readonly [asset: string]: ReadSmartContract };
  readonly address: string;
  readonly asset: string;
}): Promise<BigNumber | undefined> => smartContracts[asset].balanceOf(addressToScriptHash(address));

const getCoinBalance = async ({
  coinModel,
  client,
  smartContracts,
  monitor,
}: {
  readonly coinModel: CoinModel;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly smartContracts: { readonly [asset: string]: ReadSmartContract };
  readonly monitor: Monitor;
}): Promise<BigNumber | undefined> => {
  if ((smartContracts[coinModel.asset_id] as ReadSmartContract | undefined) !== undefined) {
    return getNEP5CoinBalance({
      smartContracts,
      address: coinModel.address_id,
      asset: coinModel.asset_id,
    });
  }

  return getSystemCoinBalance({
    address: coinModel.address_id,
    asset: coinModel.asset_id,
    client,
    monitor,
  });
};

interface CoinAndBalance {
  readonly coinModel: CoinModel;
  readonly nodeValue: BigNumber | undefined;
}

const getNodeBalances = async ({
  coins,
  client,
  smartContracts,
  monitor,
}: {
  readonly coins: ReadonlyArray<CoinModel>;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly smartContracts: { readonly [asset: string]: ReadSmartContract };
  readonly monitor: Monitor;
}): Promise<ReadonlyArray<CoinAndBalance>> => {
  const nodeBalances = await Promise.all(
    coins.map(async (coinModel) =>
      getCoinBalance({
        coinModel,
        smartContracts,
        client,
        monitor,
      }),
    ),
  );

  return utils.zip(coins, nodeBalances).map(([coinModel, nodeValue]) => ({
    coinModel,
    nodeValue,
  }));
};

const getMismatchedCoins = (coins: ReadonlyArray<CoinAndBalance>): ReadonlyArray<CoinAndBalance> =>
  coins.filter(
    ({ coinModel, nodeValue }) => nodeValue === undefined || !new BigNumber(coinModel.value).isEqualTo(nodeValue),
  );

const getCurrentHeight = async (db: Knex, monitor: Monitor) =>
  ProcessedIndex.query(db)
    .context(makeAllPowerfulQueryContext(monitor))
    .max('index')
    .first()
    // tslint:disable-next-line no-any
    .then((result) => (result === undefined || (result as any).max == undefined ? -1 : (result as any).max));

const logCoinMismatch = async ({
  coinModel,
  client,
  smartContracts,
  db,
  secondTry,
  monitor,
}: {
  readonly coinModel: CoinModel;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly smartContracts: { readonly [asset: string]: ReadSmartContract };
  readonly db: Knex;
  readonly secondTry: boolean;
  readonly monitor: Monitor;
}): Promise<void> => {
  const [dbValue, nodeValue, dbHeight, nodeCount] = await Promise.all([
    CoinModel.query(db)
      .context(makeAllPowerfulQueryContext(monitor))
      .where('id', coinModel.id)
      .first()
      .then((dbCoin) => (dbCoin === undefined ? undefined : new BigNumber(dbCoin.value))),
    getCoinBalance({
      coinModel,
      client,
      smartContracts,
      monitor,
    }),
    getCurrentHeight(db, monitor),
    client.getBlockCount(),
  ]);

  const nodeHeight = nodeCount - 1;

  if (dbHeight === nodeHeight && dbValue !== undefined && nodeValue !== undefined && !dbValue.isEqualTo(nodeValue)) {
    monitor
      .withData({
        address: coinModel.address_id,
        asset: coinModel.asset_id,
        dbValue: dbValue.toString(),
        nodeValue: nodeValue.toString(),
      })
      .logError({
        name: 'coin_db_node_mismatch',
        message: 'Coin balance mismatch between database and node',
        error: new Error('Coin balance mismatch between database and node'),
      });
  } else if (dbHeight !== nodeHeight && !secondTry) {
    await logCoinMismatch({
      coinModel,
      client,
      smartContracts,
      db,
      secondTry: true,
      monitor,
    });
  }
};

const checkBlockHeightMismatch = async ({
  client,
  maxBlockOffset,
  db,
  monitor,
}: {
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly maxBlockOffset: number;
  readonly db: Knex;
  readonly monitor: Monitor;
}): Promise<boolean> => {
  const [nodeBlockHeight, dbBlockHeight] = await Promise.all([
    client.getBlockCount(monitor),
    getCurrentHeight(db, monitor),
  ]);

  return Math.abs(nodeBlockHeight - 1 - dbBlockHeight) > maxBlockOffset;
};

const COINS_TO_PROCESS = 1000;

const checkCoins = async ({
  db,
  monitor,
  client,
  options,
  smartContracts,
  offset = 0,
}: {
  readonly db: Knex;
  readonly monitor: Monitor;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly offset?: number;
  readonly options: Options;
  readonly smartContracts: { readonly [asset: string]: ReadSmartContract };
}): Promise<number | undefined> => {
  const coins = await CoinModel.query(db)
    .context(makeAllPowerfulQueryContext(monitor))
    .orderBy('id')
    .offset(offset)
    .limit(COINS_TO_PROCESS);

  const nodeBalances = await getNodeBalances({
    coins,
    client,
    smartContracts,
    monitor,
  });

  const coinMismatches = getMismatchedCoins(nodeBalances);

  // tslint:disable-next-line no-loop-statement
  for (const batch of _.chunk(coinMismatches, options.coinMismatchBatchSize)) {
    await Promise.all(
      batch.map(async ({ coinModel }) =>
        logCoinMismatch({
          coinModel,
          client,
          smartContracts,
          db,
          secondTry: false,
          monitor,
        }),
      ),
    );
  }

  return coins.length === COINS_TO_PROCESS ? offset + COINS_TO_PROCESS : undefined;
};

export const scrapeCheck = async ({
  monitor,
  environment,
  options,
}: {
  readonly monitor: Monitor;
  readonly environment: Environment;
  readonly options: Options;
}): Promise<void> => {
  const client = new ReadClient(
    new NEOONEDataProvider({
      network: environment.network,
      rpcURL: options.rpcURL,
    }),
  );

  const db = createFromEnvironment(monitor, environment.db, options.db);

  const [blockHeightMismatch, smartContracts] = await Promise.all([
    checkBlockHeightMismatch({
      client,
      maxBlockOffset: options.maxBlockOffset,
      db,
      monitor,
    }),
    getSmartContracts({ monitor, db, client }),
  ]);

  if (blockHeightMismatch) {
    return;
  }

  let offset: number | undefined = 0;
  // tslint:disable-next-line no-loop-statement
  while (offset !== undefined) {
    offset = await checkCoins({
      monitor,
      db,
      client,
      smartContracts,
      offset,
      options,
    });
  }
};

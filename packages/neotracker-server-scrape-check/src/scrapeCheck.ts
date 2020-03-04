import {
  addressToScriptHash,
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
import { createChild, serverLogger } from '@neotracker/logger';
import {
  Asset as AssetModel,
  Coin as CoinModel,
  createFromEnvironment,
  DBOptions,
  makeAllPowerfulQueryContext,
  NEP5_CONTRACT_TYPE,
  ProcessedIndex,
} from '@neotracker/server-db';
import { utils } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import Knex from 'knex';
import _ from 'lodash';

export interface Environment {
  readonly network: NetworkType;
}

export interface Options {
  readonly db: DBOptions;
  readonly rpcURL: string;
  readonly maxBlockOffset: number;
  readonly coinMismatchBatchSize: number;
}

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

const add0x = (value: string): string => (value.startsWith('0x') ? value : `0x${value}`);

const getSmartContract = async ({
  asset,
  clientFull,
  network,
}: {
  readonly asset: string;
  readonly clientFull: Client;
  readonly network: string;
}): Promise<nep5.NEP5SmartContract> => {
  const networks = {
    [network]: {
      address: add0x(asset),
    },
  };
  const decimals = await nep5.getDecimals(clientFull, networks, network);

  // tslint:disable-next-line no-any
  return nep5.createNEP5SmartContract(clientFull, networks, decimals) as any;
};

const getSmartContracts = async ({
  db,
  clientFull,
  network,
}: {
  readonly db: Knex;
  readonly clientFull: Client;
  readonly network: string;
}): Promise<{ readonly [asset: string]: nep5.NEP5SmartContract }> => {
  const nep5Assets = await AssetModel.query(db)
    .context(makeAllPowerfulQueryContext())
    .where('type', NEP5_CONTRACT_TYPE);
  const nep5Hashes = nep5Assets.map((asset) => asset.id);
  const smartContractArray = await Promise.all(
    nep5Hashes.map(async (nep5Hash) => getSmartContract({ asset: nep5Hash, clientFull, network })),
  );

  return utils.zip(nep5Hashes, smartContractArray).reduce<{ readonly [asset: string]: nep5.NEP5SmartContract }>(
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
}: {
  readonly address: string;
  readonly asset: string;
  readonly client: ReadClient<NEOONEDataProvider>;
}): Promise<BigNumber | undefined> => {
  const account = await client.getAccount(address);

  return account.balances[add0x(asset)];
};

const getNEP5CoinBalance = async ({
  smartContracts,
  address,
  asset,
}: {
  readonly smartContracts: { readonly [asset: string]: nep5.NEP5SmartContract };
  readonly address: string;
  readonly asset: string;
}): Promise<BigNumber | undefined> => smartContracts[asset].balanceOf(addressToScriptHash(address));

const getCoinBalance = async ({
  coinModel,
  client,
  smartContracts,
}: {
  readonly coinModel: CoinModel;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly smartContracts: { readonly [asset: string]: nep5.NEP5SmartContract };
}): Promise<BigNumber | undefined> => {
  if ((smartContracts[coinModel.asset_id] as nep5.NEP5SmartContract | undefined) !== undefined) {
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
}: {
  readonly coins: ReadonlyArray<CoinModel>;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly smartContracts: { readonly [asset: string]: nep5.NEP5SmartContract };
}): Promise<ReadonlyArray<CoinAndBalance>> => {
  const nodeBalances = await Promise.all(
    coins.map(async (coinModel) =>
      getCoinBalance({
        coinModel,
        smartContracts,
        client,
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

const getCurrentHeight = async (db: Knex) =>
  ProcessedIndex.query(db)
    .context(makeAllPowerfulQueryContext())
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
}: {
  readonly coinModel: CoinModel;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly smartContracts: { readonly [asset: string]: nep5.NEP5SmartContract };
  readonly db: Knex;
  readonly secondTry: boolean;
}): Promise<void> => {
  const [dbValue, nodeValue, dbHeight, nodeCount] = await Promise.all([
    CoinModel.query(db)
      .context(makeAllPowerfulQueryContext())
      .where('id', coinModel.id)
      .first()
      .then((dbCoin) => (dbCoin === undefined ? undefined : new BigNumber(dbCoin.value))),
    getCoinBalance({
      coinModel,
      client,
      smartContracts,
    }),
    getCurrentHeight(db),
    client.getBlockCount(),
  ]);

  const nodeHeight = nodeCount - 1;

  if (dbHeight === nodeHeight && dbValue !== undefined && nodeValue !== undefined && !dbValue.isEqualTo(nodeValue)) {
    serverScrapeLogger.error(
      {
        title: 'coin_db_node_mismatch',
        address: coinModel.address_id,
        asset: coinModel.asset_id,
        dbValue: dbValue.toString(),
        nodeValue: nodeValue.toString(),
        error: new Error('Coin balance mismatch between database and node').message,
      },
      'Coin balance mismatch between database and node',
    );
  } else if (dbHeight !== nodeHeight && !secondTry) {
    await logCoinMismatch({
      coinModel,
      client,
      smartContracts,
      db,
      secondTry: true,
    });
  }
};

const checkBlockHeightMismatch = async ({
  client,
  maxBlockOffset,
  db,
}: {
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly maxBlockOffset: number;
  readonly db: Knex;
}): Promise<boolean> => {
  const [nodeBlockHeight, dbBlockHeight] = await Promise.all([client.getBlockCount(), getCurrentHeight(db)]);

  return Math.abs(nodeBlockHeight - 1 - dbBlockHeight) > maxBlockOffset;
};

const COINS_TO_PROCESS = 1000;

const checkCoins = async ({
  db,
  client,
  options,
  smartContracts,
  offset = 0,
}: {
  readonly db: Knex;
  readonly client: ReadClient<NEOONEDataProvider>;
  readonly offset?: number;
  readonly options: Options;
  readonly smartContracts: { readonly [asset: string]: nep5.NEP5SmartContract };
}): Promise<number | undefined> => {
  const coins = await CoinModel.query(db)
    .context(makeAllPowerfulQueryContext())
    .orderBy('id')
    .offset(offset)
    .limit(COINS_TO_PROCESS);

  const nodeBalances = await getNodeBalances({
    coins,
    client,
    smartContracts,
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
        }),
      ),
    );
  }

  return coins.length === COINS_TO_PROCESS ? offset + COINS_TO_PROCESS : undefined;
};

export const scrapeCheck = async ({
  environment,
  options,
}: {
  readonly environment: Environment;
  readonly options: Options;
}): Promise<void> => {
  const provider = new NEOONEDataProvider({
    network: environment.network,
    rpcURL: options.rpcURL,
  });
  const client = new ReadClient(provider);
  const clientFull = new Client({
    memory: new LocalUserAccountProvider({
      keystore: new LocalKeyStore(new LocalMemoryStore()),
      provider: new NEOONEProvider([provider]),
    }),
  });

  const db = createFromEnvironment(options.db);

  const [blockHeightMismatch, smartContracts] = await Promise.all([
    checkBlockHeightMismatch({
      client,
      maxBlockOffset: options.maxBlockOffset,
      db,
    }),
    getSmartContracts({ db, clientFull, network: environment.network }),
  ]);

  if (blockHeightMismatch) {
    return;
  }

  let offset: number | undefined = 0;
  // tslint:disable-next-line no-loop-statement
  while (offset !== undefined) {
    offset = await checkCoins({
      db,
      client,
      smartContracts,
      offset,
      options,
    });
  }
};

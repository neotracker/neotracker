/* @flow */
import {
  type DBEnvironment,
  type DBOptions,
  Coin as CoinModel,
  ProcessedIndex,
  createFromEnvironment,
  makeAllPowerfulQueryContext,
} from 'neotracker-server-db';
import {
  type NetworkType,
  type ReadSmartContract,
  ReadClient,
  NEOONEDataProvider,
  abi,
} from '@neo-one/client';
import type { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';

import knex from 'knex';
import _ from 'lodash';

export type Environment = {|
  network: NetworkType,
  db: DBEnvironment,
|};

export type Options = {|
  db: DBOptions,
  rpcURL: string,
  nep5Hashes: Array<string>,
  maxBlockOffset: number,
  coinMismatchBatchSize: number,
|};

type Coin = {|
  id: string,
  address_id: string,
  asset_id: string,
  block_index: number,
  value: number,
  nodeValue?: ?BigNumber,
|};

const add0x = (value: string): string =>
  value.startsWith('0x') ? value : `0x${value}`;

const getSmartContract = async ({
  asset,
  client,
}: {|
  asset: string,
  client: ReadClient<NEOONEDataProvider>,
|}): Promise<ReadSmartContract> => {
  const nep5ABI = await abi.NEP5(client, add0x(asset));
  return client.smartContract(add0x(asset), nep5ABI);
};

const getSmartContracts = async ({
  client,
  nep5Hashes,
}: {|
  client: ReadClient<NEOONEDataProvider>,
  nep5Hashes: Array<string>,
|}): Promise<{ [asset: string]: ReadSmartContract }> => {
  const smartContractArray = await Promise.all(
    nep5Hashes.map(nep5Hash => getSmartContract({ asset: nep5Hash, client })),
  );

  const smartContracts = {};
  _.zip(nep5Hashes, smartContractArray).forEach(contract => {
    const [nep5Hash, smartContract] = contract;
    smartContracts[nep5Hash] = smartContract;
  });
  return smartContracts;
};

const getSystemCoinBalance = async ({
  address,
  asset,
  client,
  monitor,
}: {|
  address: string,
  asset: string,
  client: ReadClient<NEOONEDataProvider>,
  monitor: Monitor,
|}): Promise<?BigNumber> => {
  const account = await client.getAccount(address, monitor);
  return account.balances[add0x(asset)];
};

const getNEP5CoinBalance = async ({
  smartContracts,
  address,
  asset,
}: {|
  smartContracts: { [asset: string]: ReadSmartContract },
  address: string,
  asset: string,
|}): Promise<?BigNumber> => smartContracts[asset].balanceOf(address);

const getCoinBalance = async ({
  coin,
  client,
  smartContracts,
  monitor,
}: {|
  coin: Coin,
  client: ReadClient<NEOONEDataProvider>,
  smartContracts: { [asset: string]: ReadSmartContract },
  monitor: Monitor,
|}): Promise<?BigNumber> => {
  let balance;
  if (smartContracts[coin.asset_id] != null) {
    balance = await getNEP5CoinBalance({
      smartContracts,
      address: coin.address_id,
      asset: coin.asset_id,
    });
  } else {
    balance = await getSystemCoinBalance({
      address: coin.address_id,
      asset: coin.asset_id,
      client,
      monitor,
    });
  }
  return balance;
};

const getNodeBalances = async ({
  coins,
  client,
  smartContracts,
  monitor,
}: {|
  coins: Array<Coin>,
  client: ReadClient<NEOONEDataProvider>,
  smartContracts: { [asset: string]: ReadSmartContract },
  monitor: Monitor,
|}): Promise<Array<Coin>> => {
  const nodeBalances = await Promise.all(
    coins.map(coin =>
      getCoinBalance({
        coin,
        smartContracts,
        client,
        monitor,
      }),
    ),
  );
  const coinsNode = _.zip(coins, nodeBalances).map(coin => ({
    ...coin[0],
    nodeValue: coin[1],
  }));

  return coinsNode;
};

const getMismatchedCoins = (coins: Array<Coin>): Array<Coin> =>
  coins.filter(
    coin =>
      coin.nodeValue == null ||
      !new BigNumber(coin.value).isEqualTo(coin.nodeValue),
  );

const logCoinMismatch = async ({
  coin,
  client,
  nep5Hashes,
  smartContracts,
  db,
  secondTry,
  monitor,
}: {|
  coin: Coin,
  client: ReadClient<NEOONEDataProvider>,
  nep5Hashes: Array<string>,
  smartContracts: { [asset: string]: ReadSmartContract },
  db: knex<*>,
  secondTry: boolean,
  monitor: Monitor,
|}): Promise<void> => {
  const [dbValue, nodeValue, dbHeight, nodeHeight] = await Promise.all([
    CoinModel.query(db)
      .context(makeAllPowerfulQueryContext(monitor))
      .where('id', coin.id)
      .then(dbCoin => (dbCoin == null ? null : new BigNumber(dbCoin.value))),
    getCoinBalance({
      coin,
      client,
      smartContracts,
      monitor,
    }),
    ProcessedIndex.query(db)
      .context(makeAllPowerfulQueryContext(monitor))
      .max('index')
      .first()
      .then(result => (result == null || result.max == null ? -1 : result.max))
      .then(res => Number(res)),
    client.getBlockCount(),
  ]);
  if (
    dbHeight === nodeHeight &&
    dbValue != null &&
    nodeValue != null &&
    !dbValue.isEqualTo(nodeValue)
  ) {
    monitor
      .withData({
        address: coin.address_id,
        asset: coin.asset_id,
        dbValue: dbValue == null ? undefined : dbValue.toString(),
        nodeValue: nodeValue == null ? undefined : nodeValue.toString(),
      })
      .logError({
        name: 'coin_db_node_mismatch',
        message: 'Coin balance mismatch between database and node',
        error: new Error('Coin balance mismatch between database and node'),
      });
  } else if (dbHeight !== nodeHeight && !secondTry) {
    await logCoinMismatch({
      coin,
      client,
      nep5Hashes,
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
}: {|
  client: ReadClient<NEOONEDataProvider>,
  maxBlockOffset: number,
  db: knex<*>,
  monitor: Monitor,
|}): Promise<boolean> => {
  const [nodeBlockHeight, dbBlockHeight] = await Promise.all([
    client.getBlockCount(monitor),
    ProcessedIndex.query(db)
      .context(makeAllPowerfulQueryContext(monitor))
      .max('index')
      .first()
      .then(result => (result == null || result.max == null ? -1 : result.max)),
  ]);

  return Math.abs(nodeBlockHeight - dbBlockHeight) > maxBlockOffset;
};

export default async ({
  monitor,
  environment,
  options,
}: {|
  monitor: Monitor,
  environment: Environment,
  options: Options,
|}): Promise<void> => {
  const client = new ReadClient(
    new NEOONEDataProvider({
      network: environment.network,
      rpcURL: options.rpcURL,
    }),
  );

  const db = createFromEnvironment(monitor, environment.db, options.db);

  const blockHeightMismatch = await checkBlockHeightMismatch({
    client,
    maxBlockOffset: options.maxBlockOffset,
    db,
    monitor,
  });
  if (blockHeightMismatch) {
    return;
  }

  const [coins, smartContracts] = await Promise.all([
    CoinModel.query(db)
      .context(makeAllPowerfulQueryContext(monitor))
      .execute(),
    getSmartContracts({
      client,
      nep5Hashes: options.nep5Hashes,
    }),
  ]);

  const nodeBalances = await getNodeBalances({
    coins,
    client,
    smartContracts,
    monitor,
  });
  const coinMismatches = getMismatchedCoins(nodeBalances);

  for (const batch of _.chunk(coinMismatches, options.coinMismatchBatchSize)) {
    // eslint-disable-next-line
    await Promise.all(
      batch.map(coin =>
        logCoinMismatch({
          coin,
          client,
          nep5Hashes: options.nep5Hashes,
          smartContracts,
          db,
          secondTry: false,
          monitor,
        }),
      ),
    );
  }
};

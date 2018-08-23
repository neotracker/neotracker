import { addressToScriptHash, ReadSmartContractAny } from '@neo-one/client';
import { metrics, Monitor } from '@neo-one/monitor';
import { Asset as AssetModel, Coin as CoinModel } from '@neotracker/server-db';
import { labels } from '@neotracker/shared-utils';
import { Context } from './types';

const NEOTRACKER_NEGATIVE_COIN_TOTAL = metrics.createCounter({
  name: 'neotracker_scrape_negative_coin_total',
});

const fetchNegativeCoins = async (context: Context, monitor: Monitor) =>
  CoinModel.query(context.db)
    .context(context.makeQueryContext(monitor))
    .where('value', '<', 0);

const updateCoin = async (context: Context, monitor: Monitor, contract: ReadSmartContractAny, coin: CoinModel) => {
  NEOTRACKER_NEGATIVE_COIN_TOTAL.inc();
  const balance = await contract.balanceOf(addressToScriptHash(coin.address_id), monitor);

  await coin
    .$query(context.db)
    .context(context.makeQueryContext(monitor))
    .patch({ value: balance.toString() });
};

const repairAssetSupply = async (
  context: Context,
  monitor: Monitor,
  assetHash: string,
  contract: ReadSmartContractAny,
) => {
  let issued;
  try {
    issued = await contract.totalSupply(monitor);
  } catch (error) {
    if (error.message.includes('Expected one of ["Integer","ByteArray"] ContractParameterTypes')) {
      return;
    }

    throw error;
  }
  await AssetModel.query(context.db)
    .context(context.makeQueryContext(monitor))
    .patch({ issued: issued.toString() })
    .where('id', assetHash);
};

const updateCoins = async (context: Context, monitor: Monitor, assetHash: string, coins: ReadonlyArray<CoinModel>) => {
  const contract = context.nep5Contracts[assetHash];
  if (contract !== undefined) {
    monitor
      .withData({
        [labels.SCRAPE_REPAIR_NEP5_COINS]: coins.length,
        [labels.SCRAPE_REPAIR_NEP5_ASSET]: assetHash,
      })
      .log({
        name: 'neotracker_scrape_repair_nep5_coins',
        level: 'verbose',
      });

    if (coins.length > 0) {
      await repairAssetSupply(context, monitor, assetHash, contract);
    }
    await Promise.all(coins.map(async (coin) => updateCoin(context, monitor, contract, coin)));
  }
};

const repairCoins = async (context: Context, monitor: Monitor) => {
  const coins = await fetchNegativeCoins(context, monitor);

  // tslint:disable-next-line readonly-array
  const assetToCoins = coins.reduce<{ [K in string]: CoinModel[] }>((mutableAcc, coin) => {
    let mutableAssetCoins = mutableAcc[coin.asset_id] as CoinModel[] | undefined;
    if (mutableAssetCoins === undefined) {
      mutableAcc[coin.asset_id] = mutableAssetCoins = [];
    }
    mutableAssetCoins.push(coin);

    return mutableAcc;
  }, {});

  await Promise.all(
    Object.entries(assetToCoins).map(async ([asset, assetCoins]) => updateCoins(context, monitor, asset, assetCoins)),
  );
};

const repair = async (context: Context, monitor: Monitor) => {
  await repairCoins(context, monitor);
};

export const repairNEP5 = async (context: Context, monitorIn: Monitor) => {
  const monitor = monitorIn.at('repair_nep5');
  try {
    await monitor.captureSpanLog(async (span) => repair(context, span), {
      name: 'neotracker_scrape_repair_nep5',
      level: { log: 'verbose', span: 'info' },
      error: {},
    });
  } catch {
    // do nothing
  }
};

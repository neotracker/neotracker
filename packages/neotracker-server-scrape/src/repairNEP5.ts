import { addressToScriptHash, nep5 } from '@neo-one/client-full';
import { AggregationType, globalStats, MeasureUnit } from '@neo-one/client-switch';
import { createChild, serverLogger } from '@neotracker/logger';
import { Asset as AssetModel, Coin as CoinModel } from '@neotracker/server-db';
import { labels } from '@neotracker/shared-utils';
import { Context } from './types';

const coinTotal = globalStats.createMeasureInt64('scrape/coin_total', MeasureUnit.UNIT);

const NEOTRACKER_NEGATIVE_COIN_TOTAL = globalStats.createView(
  'neotracker_scrape_negative_coin_total',
  coinTotal,
  AggregationType.COUNT,
  [],
  'total negative coin count',
);
globalStats.registerView(NEOTRACKER_NEGATIVE_COIN_TOTAL);

const serverScrapeLogger = createChild(serverLogger, { component: 'scrape' });

const fetchNegativeCoins = async (context: Context) =>
  CoinModel.query(context.db)
    .context(context.makeQueryContext())
    .where('value', '<', 0);

const updateCoin = async (context: Context, contract: nep5.NEP5SmartContract, coin: CoinModel) => {
  globalStats.record([
    {
      measure: coinTotal,
      value: 1,
    },
  ]);
  const balance = await contract.balanceOf(addressToScriptHash(coin.address_id));

  await coin
    .$query(context.db)
    .context(context.makeQueryContext())
    .patch({ value: balance.toString() });
};

const repairAssetSupply = async (context: Context, assetHash: string, contract: nep5.NEP5SmartContract) => {
  try {
    const issued = await contract.totalSupply();
    await AssetModel.query(context.db)
      .context(context.makeQueryContext())
      .patch({ issued: issued.toString() })
      .where('id', assetHash);
  } catch (error) {
    if (error.message.includes('Expected one of ["Integer","ByteArray"] ContractParameterTypes')) {
      return;
    }

    throw error;
  }
};

const updateCoins = async (context: Context, assetHash: string, coins: ReadonlyArray<CoinModel>) => {
  const contract = context.nep5Contracts[assetHash];
  if (contract !== undefined) {
    serverScrapeLogger.info({
      title: 'neotracker_scrape_repair_nep5_coins',
      [labels.SCRAPE_REPAIR_NEP5_COINS]: coins.length,
      [labels.SCRAPE_REPAIR_NEP5_ASSET]: assetHash,
    });

    if (coins.length > 0) {
      await repairAssetSupply(context, assetHash, contract);
    }
    await Promise.all(coins.map(async (coin) => updateCoin(context, contract, coin)));
  }
};

const repairCoins = async (context: Context) => {
  const coins = await fetchNegativeCoins(context);

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
    Object.entries(assetToCoins).map(async ([asset, assetCoins]) => updateCoins(context, asset, assetCoins)),
  );
};

const repair = async (context: Context) => {
  await repairCoins(context);
};

export const repairNEP5 = async (context: Context) => {
  try {
    serverScrapeLogger.info({ title: 'neotracker_scrape_repair_nep5' });
    await repair(context);
  } catch {
    serverScrapeLogger.error({ title: 'neotracker_scrape_repair_nep5' });
    // do nothing
  }
};

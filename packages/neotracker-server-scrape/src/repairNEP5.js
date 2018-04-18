/* @flow */
import { Asset as AssetModel, Coin as CoinModel } from 'neotracker-server-db';
import { type ReadSmartContract, addressToScriptHash } from '@neo-one/client';
import { type Monitor, metrics } from '@neo-one/monitor';

import { entries, labels } from 'neotracker-shared-utils';

import type { Context } from './types';

import { add0x, strip0x } from './utils';

const NEOTRACKER_NEGATIVE_COIN_TOTAL = metrics.createCounter({
  name: 'neotracker_scrape_negative_coin_total',
});

const fetchNegativeCoins = async (context: Context, monitor: Monitor) =>
  CoinModel.query(context.db)
    .context(context.makeQueryContext(monitor))
    .where('value', '<', 0);

const updateCoin = async (
  context: Context,
  monitor: Monitor,
  contract: ReadSmartContract,
  coin: CoinModel,
) => {
  NEOTRACKER_NEGATIVE_COIN_TOTAL.inc();
  const balance = await contract.balanceOf(
    addressToScriptHash(coin.address_id),
    monitor,
  );
  await coin
    .$query(context.db)
    .context(context.makeQueryContext(monitor))
    .patch({ value: balance });
};

const updateCoins = async (
  context: Context,
  monitor: Monitor,
  assetHash: string,
  coins: Array<CoinModel>,
) => {
  const contract = context.nep5Contracts[add0x(assetHash)];
  if (contract != null) {
    monitor
      .withData({
        [labels.SCRAPE_REPAIR_NEP5_COINS]: coins.length,
        [labels.SCRAPE_REPAIR_NEP5_ASSET]: assetHash,
      })
      .log({
        name: 'neotracker_scrape_repair_nep5_coins',
        level: 'verbose',
      });
    await Promise.all(
      coins.map(coin => updateCoin(context, monitor, contract, coin)),
    );
  }
};

const repairCoins = async (context: Context, monitor: Monitor) => {
  const coins = await fetchNegativeCoins(context, monitor);

  const assetToCoins = coins.reduce((acc, coin) => {
    if (acc[coin.asset_id] == null) {
      acc[coin.asset_id] = [];
    }
    acc[coin.asset_id].push(coin);
    return acc;
  }, {});

  await Promise.all(
    entries(assetToCoins).map(([asset, assetCoins]) =>
      updateCoins(context, monitor, asset, assetCoins),
    ),
  );
};

const repairAssetSupply = async (
  context: Context,
  monitor: Monitor,
  assetHash: string,
  contract: ReadSmartContract,
) => {
  const issued = await contract.totalSupply(monitor);
  await AssetModel.query(context.db)
    .context(context.makeQueryContext(monitor))
    .patch({ issued })
    .where('id', assetHash);

  await context.asset.refresh(assetHash, monitor);
};

const repairSupply = async (context: Context, monitor: Monitor) => {
  await Promise.all(
    entries(context.nep5Contracts).map(([assetHash0x, contract]) =>
      repairAssetSupply(context, monitor, strip0x(assetHash0x), contract),
    ),
  );
};

const repair = async (context: Context, monitor: Monitor) => {
  await Promise.all([
    repairCoins(context, monitor),
    repairSupply(context, monitor),
  ]);
};

export default async (context: Context, monitorIn: Monitor) => {
  const monitor = monitorIn.at('repair_nep5');
  await monitor.captureSpanLog(span => repair(context, span), {
    name: 'neotracker_scrape_repair_nep5',
    level: { log: 'verbose', span: 'info' },
    error: {},
  });
};

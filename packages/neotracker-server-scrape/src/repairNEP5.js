/* @flow */
import { Asset as AssetModel, Coin as CoinModel } from 'neotracker-server-db';
import { type ReadSmartContract, addressToScriptHash } from '@neo-one/client';
import { type Monitor, metrics } from '@neo-one/monitor';

import { entries, labels } from 'neotracker-shared-utils';

import type { Context } from './types';

import { add0x } from './utils';

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
    .patch({ value: balance.toString() });
};

const repairAssetSupply = async (
  context: Context,
  monitor: Monitor,
  assetHash: string,
  contract: ReadSmartContract,
) => {
  let issued;
  try {
    issued = await contract.totalSupply(monitor);
  } catch (error) {
    if (
      error.message.includes(
        'Expected one of ["Integer","ByteArray"] ContractParameterTypes',
      )
    ) {
      return;
    }

    throw error;
  }
  await AssetModel.query(context.db)
    .context(context.makeQueryContext(monitor))
    .patch({ issued: issued.toString() })
    .where('id', assetHash);

  await context.asset.refresh(assetHash, monitor);
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
    if (coins.length > 0) {
      await repairAssetSupply(context, monitor, assetHash, contract);
    }
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

const repair = async (context: Context, monitor: Monitor) => {
  await repairCoins(context, monitor);
};

export default async (context: Context, monitorIn: Monitor) => {
  const monitor = monitorIn.at('repair_nep5');
  await monitor.captureSpanLog(span => repair(context, span), {
    name: 'neotracker_scrape_repair_nep5',
    level: { log: 'verbose', span: 'info' },
    error: {},
  });
};

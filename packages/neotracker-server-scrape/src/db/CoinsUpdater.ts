import { Monitor } from '@neo-one/monitor';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { CoinChange, CoinChanges, DBContext } from '../types';
import { CoinUpdater } from './CoinUpdater';
import { DBUpdater } from './DBUpdater';

export interface CoinsSave {
  readonly blockIndex: number;
  readonly coinChanges?: CoinChanges;
}
export interface CoinsRevert {
  readonly blockIndex: number;
  readonly coinChanges?: CoinChanges;
}

export interface CoinsUpdaters {
  readonly coin: CoinUpdater;
}

const ZERO = new BigNumber('0');

export class CoinsUpdater extends DBUpdater<CoinsSave, CoinsRevert> {
  private readonly updaters: CoinsUpdaters;

  public constructor(
    context: DBContext,
    updaters: CoinsUpdaters = {
      coin: new CoinUpdater(context),
    },
  ) {
    super(context);
    this.updaters = updaters;
  }

  public async save(monitor: Monitor, { coinChanges, blockIndex }: CoinsSave): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        if (coinChanges === undefined) {
          return;
        }

        const { transactionIndex, actionIndex, changes } = coinChanges;
        const coins = this.getCoins(changes);
        await Promise.all(
          coins.map(async ({ addressHash, assetHash, value }) => {
            await this.updaters.coin.save(span, {
              addressHash,
              assetHash,
              value,
              blockIndex,
              transactionIndex,
              actionIndex,
            });
          }),
        );
      },
      { name: 'neotracker_scrape_save_coins' },
    );
  }

  public async revert(monitor: Monitor, { coinChanges, blockIndex }: CoinsRevert): Promise<void> {
    return monitor.captureSpan(
      async (span) => {
        if (coinChanges === undefined) {
          return;
        }

        const { transactionIndex, actionIndex, changes } = coinChanges;
        const coins = this.getCoins(changes);
        await Promise.all(
          coins.map(async ({ addressHash, assetHash, value }) => {
            await this.updaters.coin.revert(span, {
              addressHash,
              assetHash,
              value,
              blockIndex,
              transactionIndex,
              actionIndex,
            });
          }),
        );
      },
      { name: 'neotracker_scrape_save_coins' },
    );
  }

  private getCoins(
    changes: ReadonlyArray<CoinChange>,
  ): ReadonlyArray<{ readonly addressHash: string; readonly assetHash: string; readonly value: BigNumber }> {
    const groupedValues = Object.entries(_.groupBy(changes, ({ address }) => address));

    return _.flatMap(groupedValues, ([addressHash, values]) => {
      const reducedValues = _.mapValues(_.groupBy(values, ({ asset }) => asset), (assetValues) =>
        assetValues.reduce((acc, { value }) => acc.plus(value), ZERO),
      );

      return Object.entries(reducedValues)
        .map(([assetHash, value]) => ({ addressHash, assetHash, value }))
        .filter(({ value }) => !value.isEqualTo(ZERO));
    });
  }
}

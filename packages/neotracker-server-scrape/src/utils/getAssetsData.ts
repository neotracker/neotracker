import { Coin as CoinModel, SUBTYPE_CLAIM, SUBTYPE_ISSUE, SUBTYPE_REWARD } from '@neotracker/server-db';
import { GAS_ASSET_ID, utils } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import {
  ActionData,
  AssetData,
  Assets,
  CoinChanges,
  CoinModelChange,
  Context,
  isCoinModelCreateOrDelete,
} from '../types';
import { getEdgeCount } from './getEdgeCount';
import { getValue } from './getValue';
import { reduceCoinChanges } from './reduceCoinChanges';

const ZERO = new BigNumber('0');

interface Output {
  readonly subtype: string;
  readonly asset_id: string;
  readonly value: string;
}

interface TransactionData {
  readonly outputs: ReadonlyArray<Output>;
  // tslint:disable-next-line no-any
  readonly actionDatas: ReadonlyArray<ActionData<any>>;
  readonly transactionHash: string;
  readonly transactionID: string;
  readonly transactionIndex: number;
  readonly assetIDs: ReadonlyArray<string>;
  readonly coinChanges?: CoinChanges;
}

const getCoinData = (
  transactions: ReadonlyArray<TransactionData>,
): ReadonlyArray<{
  readonly addressHash: string;
  readonly assetHash: string;
  readonly value: BigNumber;
}> => {
  const coinChanges = transactions.reduce<CoinChanges | undefined>(
    (acc, { coinChanges: coinChangesIn }) => reduceCoinChanges(acc, coinChangesIn),
    undefined,
  );
  if (coinChanges === undefined) {
    return [];
  }

  const groupedValues = Object.entries(_.groupBy(coinChanges, ({ address }) => address));

  return _.flatMap(groupedValues, ([addressHash, values]) => {
    const reducedValues = _.mapValues(_.groupBy(values, ({ asset }) => asset), (assetValues) =>
      assetValues.reduce((acc, { value }) => acc.plus(value), ZERO),
    );

    return Object.entries(reducedValues)
      .map(([assetHash, value]) => ({ addressHash, assetHash, value }))
      .filter(({ value }) => !value.isEqualTo(ZERO));
  });
};

const getAssetOutputIssued = (outputs: ReadonlyArray<Output>): { readonly [asset: string]: BigNumber } => {
  const assetAndIssued = _.groupBy(
    outputs.filter(
      (output) =>
        output.subtype === SUBTYPE_ISSUE || output.subtype === SUBTYPE_CLAIM || output.subtype === SUBTYPE_REWARD,
    ),
    ({ asset_id }) => asset_id,
  );

  return _.mapValues(assetAndIssued, (values) =>
    values.reduce((acc, { value }) => acc.plus(new BigNumber(value)), new BigNumber('0')),
  );
};

export const getAssetsData = async ({
  context,
  transactions,
  blockIndex,
  fees,
  negated = false,
}: {
  readonly context: Context;
  readonly transactions: ReadonlyArray<TransactionData>;
  readonly blockIndex: number;
  readonly fees: BigNumber;
  readonly negated?: boolean;
}): Promise<{ readonly assets: Assets; readonly coinModelChanges: ReadonlyArray<CoinModelChange> }> => {
  const assetTransactionCounts = getEdgeCount(
    _.flatMap(transactions, ({ assetIDs, transactionID }) =>
      [...new Set(assetIDs)].map((assetID) => ({
        id1: assetID,
        id2: transactionID,
      })),
    ),
  );
  const assetTransferCounts = getEdgeCount(
    _.flatMap(transactions, ({ actionDatas }) =>
      actionDatas
        .map(({ transfer }) => transfer)
        .filter(utils.notNull)
        .map(({ result: { assetID, transferID } }) => ({
          id1: assetID,
          id2: transferID,
        })),
    ),
  );
  const coinData = getCoinData(transactions);
  const coinModels = await Promise.all(
    _.chunk(coinData, context.chunkSize).map(async (chunk) =>
      CoinModel.query(context.db)
        .context(context.makeQueryContext())
        .whereIn('id', chunk.map(({ addressHash, assetHash }) => CoinModel.makeID({ addressHash, assetHash }))),
    ),
  ).then((result) => _.flatMap(result));
  const idToCoinModel = coinModels.reduce<{ [id: string]: CoinModel | undefined }>(
    (acc, coinModel) => ({
      ...acc,
      [coinModel.id]: coinModel,
    }),
    {},
  );
  const coinModelChanges = coinData
    .map<CoinModelChange | undefined>(({ addressHash, assetHash, value }) => {
      const id = CoinModel.makeID({ addressHash, assetHash });
      const coinModel = idToCoinModel[id];
      const updatedBlockIndex = negated ? blockIndex - 1 : blockIndex;
      if (coinModel === undefined) {
        const val = negated ? value.negated() : value;
        if (val.gt(ZERO)) {
          return {
            type: 'create',
            assetHash,
            value: {
              id,
              address_id: addressHash,
              asset_id: assetHash,
              value: val.toString(),
              block_id: updatedBlockIndex,
            },
          };
        }

        return undefined;
      }
      if ((negated && blockIndex === coinModel.block_id) || (!negated && blockIndex > coinModel.block_id)) {
        const newValue = negated
          ? new BigNumber(coinModel.value).minus(value)
          : new BigNumber(coinModel.value).plus(value);
        if (newValue.isEqualTo(0)) {
          return {
            type: 'delete',
            id,
            assetHash,
          };
        }

        return {
          type: 'patch',
          value: coinModel,
          patch: {
            value: newValue.toString(),
            block_id: updatedBlockIndex,
          },
        };
      }

      return undefined;
    })
    .filter(utils.notNull);

  const assetAddressCount = _.mapValues(
    _.groupBy(coinModelChanges.filter(isCoinModelCreateOrDelete), ({ assetHash }) => assetHash),
    (assetCoinModelChanges) =>
      assetCoinModelChanges.reduce((acc, { type }) => (type === 'create' ? acc + 1 : acc - 1), 0),
  );

  const assetTransferIssued = _.mapValues(
    _.groupBy(
      _.flatMap(transactions, ({ actionDatas }) =>
        actionDatas
          .map(({ transfer }) => transfer)
          .filter(utils.notNull)
          .map(({ result: { assetID, fromAddressID, toAddressID }, value }) => {
            if (fromAddressID === undefined) {
              return { assetID, value };
            }

            if (toAddressID === undefined) {
              return { assetID, value: value.negated() };
            }

            return undefined;
          })
          .filter(utils.notNull),
      ),
      ({ assetID }) => assetID,
    ),
    (values) => values.reduce((acc, { value }) => acc.plus(value), ZERO),
  );

  const assetOutputIssued = getAssetOutputIssued(_.flatMap(transactions.map(({ outputs }) => outputs)));

  const gasIssued = fees.negated();

  const allAssetIDs = [
    ...new Set(
      [assetTransactionCounts, assetTransferCounts, assetAddressCount, assetTransferIssued, assetOutputIssued]
        .reduce((acc: ReadonlyArray<string>, value) => acc.concat(Object.keys(value)), [])
        .concat(gasIssued.isEqualTo(0) ? [] : [GAS_ASSET_ID]),
    ),
  ];

  const assets = _.fromPairs(
    allAssetIDs.map<[string, AssetData]>((asset) => [
      asset,
      {
        issued: getValue(asset, assetOutputIssued, ZERO)
          .plus(getValue(asset, assetTransferIssued, ZERO))
          .plus(asset === GAS_ASSET_ID ? gasIssued : ZERO),
        addressCount: getValue<number>(asset, assetAddressCount, 0),
        transactionCount: getValue<number>(asset, assetTransactionCounts, 0),
        transferCount: getValue<number>(asset, assetTransferCounts, 0),
      },
    ]),
  );

  return { assets, coinModelChanges };
};

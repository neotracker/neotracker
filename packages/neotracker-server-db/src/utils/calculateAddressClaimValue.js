/* @flow */
import { NEO_ASSET_ID, numbers } from 'neotracker-shared-utils';
import BigNumber from 'bignumber.js';
import type { GraphQLResolveInfo } from 'graphql';

import type { GraphQLContext } from '../types';

import calculateClaimValue from './calculateClaimValue';

import type { Address } from '../models';
import TransactionInputOutput from '../models/TransactionInputOutput';

export default async (
  address: Address,
  context: GraphQLContext,
  info: GraphQLResolveInfo,
): Promise<string> => {
  const [unclaimed, currentHeight] = await Promise.all([
    TransactionInputOutput.query(context.rootLoader.db)
      .context(context.rootLoader.makeQueryContext(context.getMonitor(info)))
      .where('address_id', address.id)
      .where('asset_id', NEO_ASSET_ID)
      .whereNull('claim_transaction_id'),
    context.rootLoader.maxIndexFetcher.get(),
  ]);
  const nonNullClaimValue = unclaimed
    .map(tio => tio.claim_value)
    .filter(Boolean)
    .reduce((acc, value) => acc.plus(new BigNumber(value)), numbers.ZERO);
  const nullClaimValue = await calculateClaimValue({
    rootLoader: context.rootLoader,
    monitor: context.getMonitor(info),
    coins: unclaimed.filter(tio => tio.claim_value == null).map(tio => ({
      value: new BigNumber(tio.value),
      startHeight: tio.output_block_index,
      endHeight: parseInt(currentHeight, 10),
    })),
  });

  return nonNullClaimValue.plus(nullClaimValue).toFixed(8);
};

import { NEO_ASSET_ID, numbers, utils } from '@neotracker/shared-utils';
import BigNumber from 'bignumber.js';
import { GraphQLResolveInfo } from 'graphql';
import { Address } from '../models';
import { TransactionInputOutput } from '../models/TransactionInputOutput';
import { GraphQLContext } from '../types';
import { calculateClaimValue } from './calculateClaimValue';

export const calculateAddressClaimValue = async (
  address: Address,
  context: GraphQLContext,
  _info: GraphQLResolveInfo,
): Promise<string> => {
  context.rootLoader.maxIndexFetcher.reset();
  const [unclaimed, currentHeight] = await Promise.all([
    TransactionInputOutput.query(context.rootLoader.db)
      .context(context.rootLoader.makeQueryContext())
      .where('address_id', address.id)
      .where('asset_id', NEO_ASSET_ID)
      .whereNull('claim_transaction_id'),
    context.rootLoader.maxIndexFetcher.get(),
  ]);

  const nonNullClaimValue = unclaimed
    .map((tio) => tio.claim_value)
    .filter(utils.notNull)
    .reduce((acc, value) => acc.plus(new BigNumber(value)), numbers.ZERO);
  const nullClaimValue = await calculateClaimValue({
    rootLoader: context.rootLoader,
    coins: unclaimed
      .filter((tio) => tio.claim_value == undefined)
      .map((tio) => ({
        value: new BigNumber(tio.value),
        startHeight: tio.output_block_id,
        endHeight: currentHeight,
      })),
  });

  return nonNullClaimValue.plus(nullClaimValue).toFixed(8);
};

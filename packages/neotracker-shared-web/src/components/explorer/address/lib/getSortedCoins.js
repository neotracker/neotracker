/* @flow */
import BigNumber from 'bignumber.js';

import _ from 'lodash';

import {
  NEO_ASSET_HASH,
  GAS_ASSET_HASH,
  NEO_COIN_ASSET,
  GAS_COIN_ASSET,
  // $FlowFixMe
} from '@neotracker/shared-utils';

import { getID } from '../../../../graphql/relay';

export default (
  coins: $ReadOnlyArray<{
    +asset: {
      +id: string,
    },
    +value: string,
  }>,
) => {
  let result = _.partition(
    coins,
    (coin) => getID(coin.asset.id) === NEO_ASSET_HASH,
  );
  let neoCoin = null;
  if (result[0].length > 0) {
    // eslint-disable-next-line
    neoCoin = result[0][0];
  } else {
    neoCoin = {
      value: '0',
      asset: NEO_COIN_ASSET,
    };
  }

  result = _.partition(
    result[1],
    (coin) => getID(coin.asset.id) === GAS_ASSET_HASH,
  );
  let gasCoin = null;
  if (result[0].length > 0) {
    // eslint-disable-next-line
    gasCoin = result[0][0];
  } else {
    gasCoin = {
      value: '0',
      asset: GAS_COIN_ASSET,
    };
  }

  const sortedResult = result[1].sort((x, y) => {
    const xNumber = new BigNumber(x.value);
    const yNumber = new BigNumber(y.value);
    if (xNumber.lt(yNumber)) {
      return -1;
    }

    if (xNumber.gt(yNumber)) {
      return 1;
    }

    return 0;
  });

  return [neoCoin, gasCoin].concat(sortedResult).filter(Boolean);
};

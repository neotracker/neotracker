/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type PriceChart_pair_data_points$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type BTCPriceChart_btc_data_points$ref: FragmentReference;
export type BTCPriceChart_btc_data_points = $ReadOnlyArray<{|
  +$fragmentRefs: PriceChart_pair_data_points$ref,
  +$refType: BTCPriceChart_btc_data_points$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "BTCPriceChart_btc_data_points",
  "type": "DataPoint",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "PriceChart_pair_data_points",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'fa5fce173bf5986c5f9b6ad8364ebff3';
module.exports = node;

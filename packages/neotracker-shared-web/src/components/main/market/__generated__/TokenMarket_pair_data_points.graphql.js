/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type BTCPriceChart_btc_data_points$ref = any;
type CNYPriceChart_cny_data_points$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TokenMarket_pair_data_points$ref: FragmentReference;
export type TokenMarket_pair_data_points = $ReadOnlyArray<{|
  +$fragmentRefs: BTCPriceChart_btc_data_points$ref & CNYPriceChart_cny_data_points$ref,
  +$refType: TokenMarket_pair_data_points$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TokenMarket_pair_data_points",
  "type": "DataPoint",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "BTCPriceChart_btc_data_points",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "CNYPriceChart_cny_data_points",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'e3719a419abd5ae67053ca122ba469a1';
module.exports = node;

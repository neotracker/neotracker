/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TokenMarket_pair_data_points$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type MarketCard_neo_btc_data_points$ref: FragmentReference;
export type MarketCard_neo_btc_data_points = $ReadOnlyArray<{|
  +$fragmentRefs: TokenMarket_pair_data_points$ref,
  +$refType: MarketCard_neo_btc_data_points$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "MarketCard_neo_btc_data_points",
  "type": "DataPoint",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TokenMarket_pair_data_points",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '3046d2b29b06c17fd2ed710f15f23ee8';
module.exports = node;

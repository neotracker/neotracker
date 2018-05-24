/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type BTCPriceChart_usd_data_points$ref = any;
type CNYPriceChart_usd_data_points$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TokenMarket_usd_data_points$ref: FragmentReference;
export type TokenMarket_usd_data_points = $ReadOnlyArray<{|
  +$fragmentRefs: BTCPriceChart_usd_data_points$ref & CNYPriceChart_usd_data_points$ref,
  +$refType: TokenMarket_usd_data_points$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TokenMarket_usd_data_points",
  "type": "DataPoint",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "BTCPriceChart_usd_data_points",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "CNYPriceChart_usd_data_points",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '413be9f1213b18e66b345b59241fdb22';
module.exports = node;

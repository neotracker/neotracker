/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type PriceChart_usd_data_points$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type BTCPriceChart_usd_data_points$ref: FragmentReference;
export type BTCPriceChart_usd_data_points = $ReadOnlyArray<{|
  +$fragmentRefs: PriceChart_usd_data_points$ref,
  +$refType: BTCPriceChart_usd_data_points$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "BTCPriceChart_usd_data_points",
  "type": "DataPoint",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "PriceChart_usd_data_points",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '5b019d33541471b191ea1cd85df3b1e4';
module.exports = node;

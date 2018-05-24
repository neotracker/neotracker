/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TokenMarket_current_price$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type MarketCard_neo_current_price$ref: FragmentReference;
export type MarketCard_neo_current_price = {|
  +$fragmentRefs: TokenMarket_current_price$ref,
  +$refType: MarketCard_neo_current_price$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "MarketCard_neo_current_price",
  "type": "CurrentPrice",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TokenMarket_current_price",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '768e5ef2b120a644658b70c0418f8f39';
module.exports = node;

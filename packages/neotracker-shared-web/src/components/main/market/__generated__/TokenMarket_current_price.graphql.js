/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type DayPrice_current_price$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TokenMarket_current_price$ref: FragmentReference;
export type TokenMarket_current_price = {|
  +$fragmentRefs: DayPrice_current_price$ref,
  +$refType: TokenMarket_current_price$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TokenMarket_current_price",
  "type": "CurrentPrice",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "DayPrice_current_price",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '7a6a45a1e5a2af5e32b3eb25ffeb29a1';
module.exports = node;

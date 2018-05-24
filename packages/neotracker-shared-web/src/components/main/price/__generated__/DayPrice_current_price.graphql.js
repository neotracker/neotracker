/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DayPrice_current_price$ref: FragmentReference;
export type DayPrice_current_price = {|
  +price_usd: number,
  +percent_change_24h: number,
  +volume_usd_24h: number,
  +market_cap_usd: number,
  +last_updated: number,
  +$refType: DayPrice_current_price$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "DayPrice_current_price",
  "type": "CurrentPrice",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "price_usd",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "percent_change_24h",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "volume_usd_24h",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "market_cap_usd",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "last_updated",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '1d151b55d245029de012cde66a8a52bc';
module.exports = node;

/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type PriceChart_usd_data_points$ref: FragmentReference;
export type PriceChart_usd_data_points = $ReadOnlyArray<{|
  +time: number,
  +value: string,
  +$refType: PriceChart_usd_data_points$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "PriceChart_usd_data_points",
  "type": "DataPoint",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "time",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "value",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'cbbb6c7d3e84836afc87e15d55df0176';
module.exports = node;

/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type PriceChart_pair_data_points$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type CNYPriceChart_cny_data_points$ref: FragmentReference;
export type CNYPriceChart_cny_data_points = $ReadOnlyArray<{|
  +$fragmentRefs: PriceChart_pair_data_points$ref,
  +$refType: CNYPriceChart_cny_data_points$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "CNYPriceChart_cny_data_points",
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
(node/*: any*/).hash = 'ebd8c6c9f37fc6c739ba27a30079d58e';
module.exports = node;

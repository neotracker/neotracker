/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type PriceChart_usd_data_points$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type CNYPriceChart_usd_data_points$ref: FragmentReference;
export type CNYPriceChart_usd_data_points = $ReadOnlyArray<{|
  +$fragmentRefs: PriceChart_usd_data_points$ref,
  +$refType: CNYPriceChart_usd_data_points$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "CNYPriceChart_usd_data_points",
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
(node/*: any*/).hash = 'b2231258e001eb609a5e4941d97dd843';
module.exports = node;

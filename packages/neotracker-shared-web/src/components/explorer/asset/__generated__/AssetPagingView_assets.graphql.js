/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AssetTable_assets$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type AssetPagingView_assets$ref: FragmentReference;
export type AssetPagingView_assets = $ReadOnlyArray<{|
  +$fragmentRefs: AssetTable_assets$ref,
  +$refType: AssetPagingView_assets$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AssetPagingView_assets",
  "type": "Asset",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "AssetTable_assets",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'e6eb9e2ca8fb1d990c6fc3868d6d3819';
module.exports = node;

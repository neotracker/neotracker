/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AssetNameLink_asset$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type AssetRegistered_asset$ref: FragmentReference;
export type AssetRegistered_asset = {|
  +$fragmentRefs: AssetNameLink_asset$ref,
  +$refType: AssetRegistered_asset$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AssetRegistered_asset",
  "type": "Asset",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "AssetNameLink_asset",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'aa48c64c28da38d3fcad59bb56d25c64';
module.exports = node;

/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type AssetTransferPagingView_asset$ref: FragmentReference;
export type AssetTransferPagingView_asset = {|
  +id: string,
  +$refType: AssetTransferPagingView_asset$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AssetTransferPagingView_asset",
  "type": "Asset",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "id",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '2543daa0b6f60fe74c0de677ac0280c1';
module.exports = node;

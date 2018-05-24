/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type AssetTransactionPagingView_asset$ref: FragmentReference;
export type AssetTransactionPagingView_asset = {|
  +id: string,
  +$refType: AssetTransactionPagingView_asset$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AssetTransactionPagingView_asset",
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
(node/*: any*/).hash = '98290771581249e8e5e32fcefd92a4a1';
module.exports = node;

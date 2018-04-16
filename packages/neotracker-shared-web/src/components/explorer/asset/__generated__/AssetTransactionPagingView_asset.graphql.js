/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from 'relay-runtime';
declare export opaque type AssetTransactionPagingView_asset$ref: FragmentReference;
export type AssetTransactionPagingView_asset = {|
  +hash: string,
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
      "name": "hash",
      "args": null,
      "storageKey": null
    }
  ]
};
(node/*: any*/).hash = '6e0733760cc5191c45891cd399a9848f';
module.exports = node;

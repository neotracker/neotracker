/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from 'relay-runtime';
declare export opaque type AssetTransferPagingView_asset$ref: FragmentReference;
export type AssetTransferPagingView_asset = {|
  +hash: string,
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
      "name": "hash",
      "args": null,
      "storageKey": null
    }
  ]
};
(node/*: any*/).hash = 'e5608d2afb1c63376b787c11bc08406c';
module.exports = node;

/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AssetNameLink_asset$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type TransferItem_transfer$ref: FragmentReference;
export type TransferItem_transfer = {|
  +from_address_hash: ?string,
  +to_address_hash: ?string,
  +value: string,
  +asset: {|
    +$fragmentRefs: AssetNameLink_asset$ref,
  |},
  +$refType: TransferItem_transfer$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransferItem_transfer",
  "type": "Transfer",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "from_address_hash",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "to_address_hash",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "value",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "asset",
      "storageKey": null,
      "args": null,
      "concreteType": "Asset",
      "plural": false,
      "selections": [
        {
          "kind": "FragmentSpread",
          "name": "AssetNameLink_asset",
          "args": null
        }
      ]
    }
  ]
};
(node/*: any*/).hash = 'f32142f654e30864230fa654b5ddecb3';
module.exports = node;

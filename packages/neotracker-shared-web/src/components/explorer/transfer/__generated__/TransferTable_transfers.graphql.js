/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AssetNameLink_asset$ref = any;
type TransferLink_transfer$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransferTable_transfers$ref: FragmentReference;
export type TransferTable_transfers = $ReadOnlyArray<{|
  +from_address_id: ?string,
  +to_address_id: ?string,
  +value: string,
  +asset: {|
    +$fragmentRefs: AssetNameLink_asset$ref
  |},
  +block_time: number,
  +$fragmentRefs: TransferLink_transfer$ref,
  +$refType: TransferTable_transfers$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransferTable_transfers",
  "type": "Transfer",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransferLink_transfer",
      "args": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "from_address_id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "to_address_id",
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
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "block_time",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'b2ee8cf22e56817d6c66c4f23d20b32c';
module.exports = node;

/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AssetNameLink_asset$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type AssetTable_assets$ref: FragmentReference;
export type AssetTable_assets = $ReadOnlyArray<{|
  +type: string,
  +amount: string,
  +issued: string,
  +transaction_id: string,
  +block_time: number,
  +address_count: number,
  +transaction_count: number,
  +$fragmentRefs: AssetNameLink_asset$ref,
  +$refType: AssetTable_assets$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AssetTable_assets",
  "type": "Asset",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "AssetNameLink_asset",
      "args": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "type",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "amount",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "issued",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "transaction_id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "block_time",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "address_count",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "transaction_count",
      "args": null,
      "storageKey": null
    }
  ]
};
(node/*: any*/).hash = '9737320dd33da9aa4eb965c3dd07a9b2';
module.exports = node;

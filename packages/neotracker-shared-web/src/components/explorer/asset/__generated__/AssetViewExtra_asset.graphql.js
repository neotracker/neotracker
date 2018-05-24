/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AssetAddressPagingView_asset$ref = any;
type AssetTransactionPagingView_asset$ref = any;
type AssetTransferPagingView_asset$ref = any;
type TransactionSummary_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type AssetViewExtra_asset$ref: FragmentReference;
export type AssetViewExtra_asset = {|
  +type: string,
  +register_transaction: {|
    +$fragmentRefs: TransactionSummary_transaction$ref
  |},
  +$fragmentRefs: AssetTransactionPagingView_asset$ref & AssetTransferPagingView_asset$ref & AssetAddressPagingView_asset$ref,
  +$refType: AssetViewExtra_asset$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AssetViewExtra_asset",
  "type": "Asset",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "type",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "register_transaction",
      "storageKey": null,
      "args": null,
      "concreteType": "Transaction",
      "plural": false,
      "selections": [
        {
          "kind": "FragmentSpread",
          "name": "TransactionSummary_transaction",
          "args": null
        }
      ]
    },
    {
      "kind": "FragmentSpread",
      "name": "AssetTransactionPagingView_asset",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "AssetTransferPagingView_asset",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "AssetAddressPagingView_asset",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'd428eaae6588d99708739ab463f7948e';
module.exports = node;

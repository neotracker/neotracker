/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AssetRegistered_asset$ref = any;
type TransactionInputPagingTable_transaction$ref = any;
type TransactionOutputPagingTable_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionRegisterSummaryBody_transaction$ref: FragmentReference;
export type TransactionRegisterSummaryBody_transaction = {|
  +asset: ?{|
    +$fragmentRefs: AssetRegistered_asset$ref
  |},
  +$fragmentRefs: TransactionInputPagingTable_transaction$ref & TransactionOutputPagingTable_transaction$ref,
  +$refType: TransactionRegisterSummaryBody_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionRegisterSummaryBody_transaction",
  "type": "Transaction",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransactionInputPagingTable_transaction",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionOutputPagingTable_transaction",
      "args": null
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
          "name": "AssetRegistered_asset",
          "args": null
        }
      ]
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '9d01c6a770ee91979f8ab193881a7edb';
module.exports = node;

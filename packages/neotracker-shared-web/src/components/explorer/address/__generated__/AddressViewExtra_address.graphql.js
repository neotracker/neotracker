/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AddressTransactionPagingView_address$ref = any;
type AddressTransferPagingView_address$ref = any;
type TransactionSummary_transaction$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type AddressViewExtra_address$ref: FragmentReference;
export type AddressViewExtra_address = {|
  +hash: string,
  +first_transaction: ?{|
    +$fragmentRefs: TransactionSummary_transaction$ref,
  |},
  +$fragmentRefs: (AddressTransactionPagingView_address$ref & AddressTransferPagingView_address$ref),
  +$refType: AddressViewExtra_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AddressViewExtra_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "hash",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "first_transaction",
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
      "name": "AddressTransactionPagingView_address",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "AddressTransferPagingView_address",
      "args": null
    }
  ]
};
(node/*: any*/).hash = '3131720f1df3621c6ffd7ef985dbd50c';
module.exports = node;

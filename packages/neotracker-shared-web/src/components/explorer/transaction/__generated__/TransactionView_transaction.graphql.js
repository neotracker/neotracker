/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionSummaryBody_transaction$ref = any;
type TransactionViewExtra_transaction$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type TransactionView_transaction$ref: FragmentReference;
export type TransactionView_transaction = {|
  +type: string,
  +id: string,
  +network_fee: string,
  +system_fee: string,
  +size: number,
  +block_time: number,
  +block: {|
    +confirmations: number,
    +index: number,
  |},
  +$fragmentRefs: (TransactionSummaryBody_transaction$ref & TransactionViewExtra_transaction$ref),
  +$refType: TransactionView_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionView_transaction",
  "type": "Transaction",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransactionSummaryBody_transaction",
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
      "name": "id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "network_fee",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "system_fee",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "size",
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
      "kind": "LinkedField",
      "alias": null,
      "name": "block",
      "storageKey": null,
      "args": null,
      "concreteType": "Block",
      "plural": false,
      "selections": [
        {
          "kind": "ScalarField",
          "alias": null,
          "name": "confirmations",
          "args": null,
          "storageKey": null
        },
        {
          "kind": "ScalarField",
          "alias": null,
          "name": "index",
          "args": null,
          "storageKey": null
        }
      ]
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionViewExtra_transaction",
      "args": null
    }
  ]
};
(node/*: any*/).hash = 'd2064c80d74c3c92aba2d4f1cfe349d7';
module.exports = node;

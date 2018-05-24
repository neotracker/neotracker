/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionInputPagingTable_transaction$ref = any;
type TransactionOutputPagingTable_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionEnrollmentSummaryBody_transaction$ref: FragmentReference;
export type TransactionEnrollmentSummaryBody_transaction = {|
  +enrollment: ?{|
    +address: {|
      +id: string
    |}
  |},
  +$fragmentRefs: TransactionInputPagingTable_transaction$ref & TransactionOutputPagingTable_transaction$ref,
  +$refType: TransactionEnrollmentSummaryBody_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionEnrollmentSummaryBody_transaction",
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
      "name": "enrollment",
      "storageKey": null,
      "args": null,
      "concreteType": "TransactionInputOutput",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "address",
          "storageKey": null,
          "args": null,
          "concreteType": "Address",
          "plural": false,
          "selections": [
            {
              "kind": "ScalarField",
              "alias": null,
              "name": "id",
              "args": null,
              "storageKey": null
            }
          ]
        }
      ]
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '558bcfd30dd431ca65dc96a7dc758689';
module.exports = node;

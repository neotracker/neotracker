/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionSummary_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionSummaryList_transactions$ref: FragmentReference;
export type TransactionSummaryList_transactions = $ReadOnlyArray<{|
  +id: string,
  +$fragmentRefs: TransactionSummary_transaction$ref,
  +$refType: TransactionSummaryList_transactions$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionSummaryList_transactions",
  "type": "Transaction",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionSummary_transaction",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '233d8bff4060ca45833bc4ae66b5ece5';
module.exports = node;

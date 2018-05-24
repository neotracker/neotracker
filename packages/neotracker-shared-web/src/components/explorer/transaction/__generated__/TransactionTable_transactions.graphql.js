/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionSummary_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionTable_transactions$ref: FragmentReference;
export type TransactionTable_transactions = $ReadOnlyArray<{|
  +id: string,
  +$fragmentRefs: TransactionSummary_transaction$ref,
  +$refType: TransactionTable_transactions$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionTable_transactions",
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
(node/*: any*/).hash = '3480e90d25a902ba3bea06d783e3c885';
module.exports = node;

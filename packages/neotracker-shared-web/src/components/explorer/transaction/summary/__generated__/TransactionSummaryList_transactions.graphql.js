/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionSummary_transaction$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type TransactionSummaryList_transactions$ref: FragmentReference;
export type TransactionSummaryList_transactions = $ReadOnlyArray<{|
  +hash: string,
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
      "name": "hash",
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
(node/*: any*/).hash = '303275f345a22ec4157bd2282ec36578';
module.exports = node;

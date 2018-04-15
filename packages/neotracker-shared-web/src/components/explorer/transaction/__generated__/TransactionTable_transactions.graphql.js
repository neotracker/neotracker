/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionSummary_transaction$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type TransactionTable_transactions$ref: FragmentReference;
export type TransactionTable_transactions = $ReadOnlyArray<{|
  +hash: string,
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
(node/*: any*/).hash = '8ba4759afae2818e0b2316de565f50aa';
module.exports = node;

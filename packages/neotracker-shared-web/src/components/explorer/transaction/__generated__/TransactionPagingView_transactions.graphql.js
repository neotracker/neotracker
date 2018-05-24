/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionTable_transactions$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionPagingView_transactions$ref: FragmentReference;
export type TransactionPagingView_transactions = $ReadOnlyArray<{|
  +$fragmentRefs: TransactionTable_transactions$ref,
  +$refType: TransactionPagingView_transactions$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionPagingView_transactions",
  "type": "Transaction",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransactionTable_transactions",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '540a4ffa16dde8ff7ecb57c01c8e19c8';
module.exports = node;

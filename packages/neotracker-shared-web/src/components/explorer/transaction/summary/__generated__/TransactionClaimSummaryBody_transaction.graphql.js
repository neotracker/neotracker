/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionClaimPagingTable_transaction$ref = any;
type TransactionOutputPagingTable_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionClaimSummaryBody_transaction$ref: FragmentReference;
export type TransactionClaimSummaryBody_transaction = {|
  +$fragmentRefs: TransactionClaimPagingTable_transaction$ref & TransactionOutputPagingTable_transaction$ref,
  +$refType: TransactionClaimSummaryBody_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionClaimSummaryBody_transaction",
  "type": "Transaction",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransactionClaimPagingTable_transaction",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionOutputPagingTable_transaction",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'c65b915902095c38085099160b24503d';
module.exports = node;

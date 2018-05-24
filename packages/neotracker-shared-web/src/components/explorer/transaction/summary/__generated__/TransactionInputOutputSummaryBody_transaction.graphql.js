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
declare export opaque type TransactionInputOutputSummaryBody_transaction$ref: FragmentReference;
export type TransactionInputOutputSummaryBody_transaction = {|
  +$fragmentRefs: TransactionInputPagingTable_transaction$ref & TransactionOutputPagingTable_transaction$ref,
  +$refType: TransactionInputOutputSummaryBody_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionInputOutputSummaryBody_transaction",
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
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '9be699b1d67f1531bc3c37650a8e691a';
module.exports = node;

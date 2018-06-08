/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionSummaryHeader_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionSummary_transaction$ref: FragmentReference;
export type TransactionSummary_transaction = {|
  +hash: string,
  +$fragmentRefs: TransactionSummaryHeader_transaction$ref,
  +$refType: TransactionSummary_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionSummary_transaction",
  "type": "Transaction",
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
      "kind": "FragmentSpread",
      "name": "TransactionSummaryHeader_transaction",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '2181b2932df1a1aa8462c2e0cda103d4';
module.exports = node;

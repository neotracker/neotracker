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
  +id: string,
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
      "name": "id",
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
(node/*: any*/).hash = '14bc5b5f8327bf42e2f6655b36f6da9b';
module.exports = node;

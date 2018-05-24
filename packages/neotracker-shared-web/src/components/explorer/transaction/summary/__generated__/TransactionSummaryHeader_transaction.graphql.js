/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionHeaderBackground_transaction$ref = any;
type TransactionTypeAndLink_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionSummaryHeader_transaction$ref: FragmentReference;
export type TransactionSummaryHeader_transaction = {|
  +type: string,
  +block_time: number,
  +$fragmentRefs: TransactionHeaderBackground_transaction$ref & TransactionTypeAndLink_transaction$ref,
  +$refType: TransactionSummaryHeader_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionSummaryHeader_transaction",
  "type": "Transaction",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransactionHeaderBackground_transaction",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionTypeAndLink_transaction",
      "args": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "type",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "block_time",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '813c539ce522231abe530c052c5cd8ca';
module.exports = node;

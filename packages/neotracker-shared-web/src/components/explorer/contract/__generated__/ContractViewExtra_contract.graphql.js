/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionSummary_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type ContractViewExtra_contract$ref: FragmentReference;
export type ContractViewExtra_contract = {|
  +script: string,
  +transaction: {|
    +$fragmentRefs: TransactionSummary_transaction$ref
  |},
  +$refType: ContractViewExtra_contract$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "ContractViewExtra_contract",
  "type": "Contract",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "script",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "transaction",
      "storageKey": null,
      "args": null,
      "concreteType": "Transaction",
      "plural": false,
      "selections": [
        {
          "kind": "FragmentSpread",
          "name": "TransactionSummary_transaction",
          "args": null
        }
      ]
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '6cadf5222dc2039b1b562e0ca765134d';
module.exports = node;

/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionInputOutputTable_input_outputs$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionOutputTable_outputs$ref: FragmentReference;
export type TransactionOutputTable_outputs = $ReadOnlyArray<{|
  +input_transaction_id: ?string,
  +$fragmentRefs: TransactionInputOutputTable_input_outputs$ref,
  +$refType: TransactionOutputTable_outputs$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionOutputTable_outputs",
  "type": "TransactionInputOutput",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransactionInputOutputTable_input_outputs",
      "args": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "input_transaction_id",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '4f77429194c586fa94176e31981bc145';
module.exports = node;
